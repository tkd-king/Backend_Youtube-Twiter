import { Router } from "express";
import {
  apdateAcountDetails,
  apdateUserAvatar,
  apdateUserCoverImage,
  changeCurrentPassword,
  getCurrentUser,
  getUserChennleProfile,
  getWatvchHistory,
  loginUser,
  logoutUser,
  ragisterUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.meddleware.js";
import { varifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage", // mn nay yaha pr coverImage field nahe add kia tha jo mn nay bad mn add kia
      maxCount: 1,
    },
  ]),
  ragisterUser
);
router.route("/login").post(loginUser);
//secure routes
router.route("/logout").post(varifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(varifyJWT, changeCurrentPassword);
router.route("/current-user").get(varifyJWT, getCurrentUser);
router.route("/update-account").patch(varifyJWT, apdateAcountDetails);
router
  .route("/avatar")
  .patch(varifyJWT, upload.single("avatar"), apdateUserAvatar);
router
  .route("/cover-Image")
  .patch(varifyJWT, upload.single("coverImage"), apdateUserCoverImage); // TODO: yaha pr /cover-Image likha h sir nay mn nay / nahe likha error hoa to dekh lo ga
router.route("/c/:username").get(varifyJWT, getUserChennleProfile);
router.route("/watchHistory").get(varifyJWT, getWatvchHistory);
export default router;
