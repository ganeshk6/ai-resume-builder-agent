import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
    return jwt.sign(
        { sub: userId.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

export const setAuthCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};