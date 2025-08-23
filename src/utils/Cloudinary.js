import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath ) return null;

        //upload the file to a specific folder in cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: "YOUTUBE-BACKEND",  // 👈 project folder
            resource_type: "auto"
        });

        // file has been uploaded successfully
        console.log("File is uploaded on cloudinary : ", response.url)

        // delete file from local storage after upload
        fs.unlinkSync(localFilePath); // it should synchronous work
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove file if upload fails
        return null;
    }
}