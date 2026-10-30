import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            trim:true,
            require:true
        },
        email:{
            type:String,
            require:true,
            unique:true
        },
        password:{
            type: String,
            select: false,
        },
        firebaseUid: {
            type: String,
            unique: true,
            sparse: true,
        },
        profilePicture:{
            type: String,
            default: null,
        },
        authProvider:{
            type: String,
            enum: ["email", "google"],
            default: "email",
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
    },{
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User;