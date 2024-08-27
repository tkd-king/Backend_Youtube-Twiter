import {Router} from "express"
import { loginUser, logoutUser, ragisterUser, refreshAccessToken } from "../controllers/user.controller.js"
import upload from "../middlewares/multer.meddleware.js"
import { varifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router()

router.route("/register").post(
    upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",// mn nay yaha pr coverImage field nahe add kia tha jo mn nay bad mn add kia 
        maxCount:1
    }
])  ,
ragisterUser)
router.route("/login").post(loginUser)
//secure routes
router.route("/logout").post(  varifyJWT ,logoutUser )
router.route("/refresh-token").post( refreshAccessToken )

export default router