import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req,res) => {
     // Extract user details from the request body
        const { fullName, username, email, password } = req.body;
        console.log("Email",email);
    // Validate required fields (username, email, password)
        if (
            [fullName, email, username, password].some((field) => (
                field?.trim() === ""
            ))
        ) {
            throw new ApiError(400,"All Fields are required!")
        }

        // Check if a user with the same username or email already exists
        const existedUser = await User.findOne({$or : [{ email },{ username }]})
            if(existedUser) {
                throw new ApiError(409,"User with Email or username already exists")
            }
            
        // Handle avatar/image upload if provided
        // - Validate image format and size
        // - Upload to Cloudinary (or other storage)
        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocalPath = req.files?.coverImage[0]?.path;

        if(!avatarLocalPath) {
            throw new ApiError(400,"Avatar is requried")
        }
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if(!avatar) throw new ApiError(400,"Avatar is requried")

    // Create a new user in the database with the provided details
    const user = await User.create({
                fullName, avatar : avatar.url,
                coverImage : coverImage?.url || "",
                email,
                password,
                username : username.toLowercase()
        })
        
    // Remove sensitive fields (password, refresh token) before sending response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // Check if user creation was successful
    // - If successful, return user data
    // - If not, throw an appropriate error
    if(!createdUser) throw new ApiError(500,"Something Went Wrong while registering the user")
        return res.status(201).json(new ApiResponse(200,createdUser,"user registered successfully"))
    
    
})

export { registerUser }