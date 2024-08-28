import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinory } from "../utils/cloudinory.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const genrateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findOne(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: true });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};
//asyncHandler
const ragisterUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  console.log("email: ", email);
  console.log("fullName: ", fullName);
  console.log("username: ", username);
  console.log("password: ", password);

  if (
    [fullName, email, password, username].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required ");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists"); // mn nay bahut jaga apierror ky sath new nahe likha or error lea ab kio k mn nay ApiError ek cunstrontor likha h new add krna lazmi h ta k destructure kr sako :)
  }
  // console.log(req.files)
  const avatarLocalePath = req.files?.avatar[0]?.path;
  console.log(avatarLocalePath);

  //  const coverImageLocalePath = req.files?.coverImage[0]?.path
  //  console.log(coverImageLocalePath); [({proofed})]

  if (!avatarLocalePath) {
    throw new ApiError(
      400,
      "Avatar file is required line:33 file user.controller.js"
    );
  }

  let coverImageLocalePath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalePath = req.files?.coverImage[0]?.path;
  }
  const avatar = await uploadOnCloudinory(avatarLocalePath);
  console.log(avatar.path);

  const coverImage = await uploadOnCloudinory(coverImageLocalePath);
  // console.log(coverImage.path);

  if (!avatar) {
    throw new ApiError(
      400,
      "Avatar file is required line:44 file user.controller.js"
    );
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email,
    password: password,
    username: username.toLowerCase(),
  });
  // yaha pr mn nay mistake ky thy k | User ky jaga user likha or ghanta betha raha error ko lay kr next mistake naho kabhe :)
  // const createdUser =  await user.findById(User._id).select(
  //   "-password -refreshToken "
  // )
  // ek or mistake mn user._id ky jaga User._id likh raha tha kio mn nay find krna tha jo user abhe bana h but mn find kr raha tha jis kay pass _id h he nahe so thanks chatgpt :)
  const createdUser = await User.findById(user._id).select(
    " -password -refreshToken "
  );
  console.log(createdUser);

  if (!createdUser) {
    throw new ApiError(500, "Some thing wents wrong while registring a User");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and refresh token
  //send cookie
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
    user._id
  );

  const logedInUser = await User.findById(user._id).select(
    " -password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: logedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,

    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out "));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } = await genrateAccessAndRefreshToken(
      user._id
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token is Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refreshToken ");
  }
});
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Incorrect current password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: true });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});
const apdateAcountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, username } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
        username,
      },
    },
    {
      new: true,
    }
  ).select("-password ");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "account details updated successfully"));
});
const apdateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalePath = req.file.path;
  if (!avatarLocalePath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const avatar = await uploadOnCloudinory(avatarLocalePath);
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }
  const user = await User.findByIdAndUpdate(
   req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Updated Successfully"));
});
const apdateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }
  const coverImage = await uploadOnCloudinory(coverImageLocalPath);
  if (!coverImage) {
    throw new ApiError(400, "Error while uploading coverImage");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select(" -password");

  return res
  .status(200)
  .json(new ApiResponse(200, user, "CoverImage Updated Successfully"));
});

export {
  ragisterUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  apdateAcountDetails,
  apdateUserAvatar,
  apdateUserCoverImage,
};
