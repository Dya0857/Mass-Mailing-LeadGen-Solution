import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Register new user
export const registerUser = async (req, res) => {
  try {
    const { name, company, domain, email, password } = req.body;

    // Validate required fields
    if (!name || !company || !domain || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      company,
      domain,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        company: user.company,
        domain: user.domain,
        email: user.email,
        token: generateToken(user._id), // if using JWT
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Login existing user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
  {
    id: user._id,
    name: user.name,
    email: user.email,
  },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);


    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
