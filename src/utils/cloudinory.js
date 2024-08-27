import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET 
    });

    const uploadOnCloudinory = async (localeFilePath) =>{   
        try {
            if (!localeFilePath) return null
            const response = await cloudinary.uploader.upload(localeFilePath,{ 
                resource_type:"auto"
             })
             //console.log("file isuploaded succesfully on cloudinory: ",response.url) { proofed }
             fs.unlinkSync(localeFilePath)
             return response
        } catch (error) {
            fs.unlinkSync(localeFilePath)//remove the localy saved tamprary file as the upload opration got failed
            return null
        }
    }

    export {uploadOnCloudinory}