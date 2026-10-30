import bcrypt from "bcryptjs";
import { errorResponse, successResponse } from "../../../utils/response.js";
import User from "../models/auth.model.js";
import {generateToken, setAuthCookie } from "../../../utils/generateToken.js";
import { getAuth } from "firebase-admin/auth";
import { app } from "../../../config/firebase.js";

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name?.trim() || !email?.trim() || !password) {
            return errorResponse(res, 400, false, "Name, email and password are required")
        }

        if(password.length < 8){
            return errorResponse(res, 400, false, "Password must be at least 8 characters")
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if(existingUser){
            return errorResponse(res, 400, false, "Email is already registered")
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            authProvider: "email",
        })

        const token = generateToken(user._id);
        setAuthCookie(res, token);

        const data = {
            id: user._id,
            name: user.name,
            email: user.email,
            authProvider: user.authProvider,
        }

        return successResponse(res, 201, data, "Registration successful")

    } catch (error) {
        return errorResponse(res, 500, false, `Registration failed ${error?.message}`)
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email?.trim() || !password) {
            return errorResponse(res, 400, false, "Email and password are required")
        }
        
        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        }).select("+password");

        if(!user || !user.password){
            return errorResponse(res, 401, false, "Invalid email or password")
        }

        const isPasswordvalid = await bcrypt.compare(
            password,
            user.password
        )

        if(!isPasswordvalid){
            return errorResponse(res, 401, false, "Invalid email or password")
        }

        const token = generateToken(user._id);
        setAuthCookie(res, token)

        const data = {
            id: user._id,
            name: user.name,
            email: user.email,
            authProvider: user.authProvider,
        }

        return successResponse(res, 200, data, "Login successful")

    } catch (error) {
        return errorResponse(res, 500, false, `Login failed ${error?.message}`,)
    }
}

export const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return errorResponse(res, 400, false, "Firebase ID token is required")
        }

        const decodedToken = await getAuth(app).verifyIdToken(idToken);
        
        const {uid, email, name, picture, email_verified} = decodedToken;

        if (!email || !email_verified) {
            return errorResponse(res, 401, false, "A verified Google email is required")
        }

        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            const normalizedEmail = email.toLowerCase();

            user = await User.findOne({ email: normalizedEmail });

            if (user) {
                user.firebaseUid = uid;
                user.isEmailVerified = true;

                if (!user.password) {
                    user.authProvider = "google";
                }

                if (!user.profilePicture && picture) {
                    user.profilePicture = picture;
                }

                if (!user.name && name) {
                    user.name = name;
                }

                await user.save();
            } else {
                user = await User.create({
                    name: name || email.split("@")[0],
                    email: normalizedEmail,
                    firebaseUid: uid,
                    profilePicture: picture || null,
                    authProvider: "google",
                    isEmailVerified: true,
                });
            }
        }

        const token = await generateToken(user._id);
        await setAuthCookie(res, token)

        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            authProvider: user.authProvider
        }

        return successResponse(res, 200, userData, "Google login successful")
    } catch (error) {
        return errorResponse(res, 500, false, `Google authentication failed ${error?.message}`,)
    }
};

export const getUserprofile = async (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        },
    });
}

export const logout = async(req, res) => {
    try {
        res.clearCookie("token",{
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        })
        return successResponse(res, 200, null, "Logged out successfully");
    } catch (error) {
        return errorResponse(res, 500, false, `Logging out error ${error?.message}`,)
    }
}