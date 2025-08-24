import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken(userId)
        const refreshToken = await user.generateRefreshToken(userId)

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token!")
    }
}

const registerUser = asyncHandler(async (req,res) => {
     // Extract user details from the request body
        const { fullName, username, email, password} = req.body;
        
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
        // let avatarLocalPath;
        //  if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        //     avatarLocalPath = req.files.avatar[0].path;
        // }
        // const coverImageLocalPath = req.files?.coverImage[0]?.path;
        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }
        
        if(!avatarLocalPath) {
            throw new ApiError(400,"Avatar is requried")
        }
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if(!avatar) throw new ApiError(400,"Avatar is requried")

    // Create a new user in the database with the provided details
    const user = await User.create({
                fullName, avatar : avatar.secure_url,
                coverImage : coverImage?.secure_url || "",
                email,
                password,
                username : username.toLowerCase()
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

const loginUser = asyncHandler(async (req,res) => {
     // 1. Extract login credentials from request body (username/email and password)
        const {username, email, password} = req.body;
        
    // 2. Validate input: ensure required fields are provided
        if(!username && !email) throw new ApiError(400,"username or email is required")

    // 3. Find the user in the database by username or email
        const user = await User.findOne({
            $or : [{username}, {email}]
        });

    // 4. If user exists, verify the provided password against stored hash
        if(!user) throw new ApiError(404,"user doesnot exist")
        
        const isPasswordValid = await user.isPasswordCorrect(password);
        if(!isPasswordValid) throw new ApiError(401,"Invalid User Credentials")

    // 5. If password is correct, generate authentication tokens:
    //    - Access token (short-lived)
    //    - Refresh token (long-lived)
        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    // 6. Send refresh token as a cookie and return access token & user info in response
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly : true,
            secure : true
        }

        return res.status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json(new ApiResponse(200,{user : loggedInUser,accessToken,refreshToken}
                ,"user LoggedIn successfully"
            ))
})

const logoutuser = asyncHandler(async (req,res) => {
    
        await User.findByIdAndUpdate(req.user._id, {$set : {refreshToken : undefined}}, {new : true})
        const options = {
            httpOnly : true,
            secure : true
        }
        return res.status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(new ApiResponse(200,{},"user loggedOut successfully"))
})
export { registerUser, loginUser, logoutuser }