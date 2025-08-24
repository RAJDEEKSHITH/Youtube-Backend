import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    // Try to get token from cookies, then from Authorization header
    let token = req.cookies?.accessToken;

    if (!token) {
      // Express header name is "authorization" (lowercase)
      token = req.header("Authorization") || req.headers["authorization"];
      // Remove "Bearer " prefix if present
      if (typeof token === "string" && token.startsWith("Bearer ")) {
        token = token.replace("Bearer ", "");
      }
    }

    // Check if token exists and is a string
    if (!token || typeof token !== "string" || token.trim() === "") {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify JWT
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find user from decoded token
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(401, "Invalid AccessToken");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid AccessToken");
  }
});


