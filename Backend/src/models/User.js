import Mongoose from "mongoose";
// import { use } from "react";
import bcrypt from "bcryptjs";

const userSchema = new Mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    bio: {
        type: String,
        default: "",
    },
    profilePicture: {
        type: String,
        default: "",
    },
    nativeLanguage: {
        type: String,
        default: "",    
    },
    learningLanguage: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
    isOnboarded: {
        type: Boolean,
        default: false,
    },
    friends: [{
        type: Mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    
}, {timestamps: true})



// TODO: Explain This once again
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
     try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();

     }catch(err){
        return next(err);
     }
})

userSchema.methods.matchPassword = async function(enteredPassword){
    const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
    return isPasswordCorrect;

}

const User = Mongoose.model("User", userSchema);

export default User;