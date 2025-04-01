import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/utils.js";
import cloudinary from "../config/cloudinary.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });

    const userEmailExists = await User.findOne({ email });
    const userNameExists = await User.findOne({ name });

    if (userEmailExists)
      return res.status(400).json({ message: "Email already exists" });

    if (userNameExists)
      return res.status(400).json({ message: "Name already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "invalid user data" });
    }
  } catch (error) {
    console.error(`Error in signup controller ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordCorrect = bcrypt.compare(user.password, password);

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    res.status(200).json({ message: `Logging in as ${user.name}` });
  } catch (err) {
    console.error(`Error in login controller ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logging out" });
  } catch (err) {
    console.error(`Error in logout ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic)
      return res.status(400).json({ message: "Profile pic is required" });

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(`Error in updating the profile pic ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error(`Error in checkAuth ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
