
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";


export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const profilePictureUrl = `https://randomuser.me/api/portraits/lego/${idx}.jpg`;

    const newUser = await User.create({
      email,
      password,
      fullName,
      profilePicture: profilePictureUrl,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePicture || "",
      });
      console.log(`Stream user created for ${newUser.fullName} ${newUser.email} `);


    } catch (error) {
      console.log("Error creating stream user:", error);
      
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error in Signup Controller:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Invalid  password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error in Login Controller:", error);
    res.status(500).json({ message: "Server error during login" });
  }
}
export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}

export async function onboarding(req, res) {
  try {
    // Check karo ki middleware ne user diya ya nahi
    if (!req.user) {
      return res.status(401).json({ message: "Bhai, pehle login to kar lo!" });
    }

    const userId = req.user._id;
    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

    // Yaha || (OR) use karo
    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({ message: "Saari details bharna zaroori hai!" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, bio, nativeLanguage, learningLanguage, location, isOnboarded: true },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Database mein user nahi mila" });
    }

    res.status(200).json({ message: "Onboarding Done!", user: updatedUser });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}