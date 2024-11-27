import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import validateUser from "../validators/validateUser.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

//Create a new user and log them in
router.post("/", validateUser, async (req, res) => {
  try {
    const user = new User(req.body).select("-password -__v");
    user.password = await bcrypt.hash(user.password, 8);
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({ message: "User successfully created", user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password -__v");
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password -__v"); // Récupère tous les utilisateurs
    res.status(200).json(users); // Retourne les utilisateurs en JSON
  } catch (err) {
    console.error(err.message); // Affiche l'erreur dans la console
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get a user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -__v"); // Récupère l'utilisateur par son ID
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user); // Retourne l'utilisateur en JSON
  } catch (err) {
    console.error(err.message); // Affiche l'erreur dans la console
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Get a user by username
router.get("/username/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password -__v"
    ); // Récupère l'utilisateur par son username
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user); // Retourne l'utilisateur en JSON
  } catch (err) {
    console.error(err.message); // Affiche l'erreur dans la console
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a user by ID
router.put("/:id", auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -__v");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a user by ID
router.delete("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // Récupère l'utilisateur par son ID
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.deleteOne(); // Supprime l'utilisateur
    res.status(200).json({ message: "User successfully deleted" }); // Retourne un message de succès
  } catch (err) {
    console.error(err.message); // Affiche l'erreur dans la console
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
