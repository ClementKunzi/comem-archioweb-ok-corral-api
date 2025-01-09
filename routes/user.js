import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import validateUser from "../validators/validateUser.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/upload.js"; // Importer le middleware upload
import multer from "multer";
import checkAlreadyLoggedIn from "../middlewares/checkAlreadyLoggedIn.js";
import BlacklistToken from "../models/BlacklistToken.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The user's username
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *         profilePhoto:
 *           type: string
 *           description: The URL of the user's profile photo
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *           description: The user's location
 *         isLoggedIn:
 *           type: boolean
 *           description: Indicates if the user is currently logged in
 *       example:
 *         id: d5fE_asz
 *         username: johndoe
 *         email: johndoe@example.com
 *         password: secret
 *         profilePhoto: uploads/12345.jpg
 *         location: { type: "Point", coordinates: [2.3522, 48.8566] }
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 */

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 */
router.post("/", upload.none(), validateUser, async (req, res) => {
  try {
    const user = new User(req.body);
    user.password = await bcrypt.hash(user.password, 8);
    user.isLoggedIn = true; // Set isLoggedIn to false by default
    await user.save();

    // Récupérer l'utilisateur sans le mot de passe et __v
    const savedUser = await User.findById(user._id).select("-password -__v");

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res
      .status(201)
      .json({ message: "User successfully created", user: savedUser, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid username or password
 *       500:
 *         description: Internal Server Error
 */
router.post("/login", upload.none(), async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    if (user.isLoggedIn) {
      return res
        .status(400)
        .json({ error: "User already logged in on another session." });
    }

    user.isLoggedIn = true;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Internal Server Error
 */
router.post("/logout", auth, async (req, res) => {
  try {
    const user = req.user;

    user.isLoggedIn = false;
    await user.save();

    const blacklistToken = new BlacklistToken({ token: req.token });
    await blacklistToken.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
/**
 * @swagger
 * /user/profile-photo:
 *   post:
 *     summary: Upload a profile photo
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile photo uploaded successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/profile-photo",
  auth,
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Supprimer l'ancienne photo de profil si elle existe
      if (user.profilePhoto) {
        fs.unlinkSync(user.profilePhoto);
      }

      user.profilePhoto = path.normalize(req.file.path); // Normaliser le chemin de la photo de profil
      await user.save();

      res
        .status(200)
        .json({ message: "Profile photo uploaded successfully", user });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/**
 * @swagger
 * /user/profile-photo:
 *   delete:
 *     summary: Delete a profile photo
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile photo deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/profile-photo", upload.none(), auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Supprimer la photo de profil si elle existe
    if (user.profilePhoto) {
      fs.unlinkSync(user.profilePhoto);
      user.profilePhoto = undefined;
      await user.save();
    }

    res.status(200).json({ message: "Profile photo deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal Server Error
 */
router.get("/", upload.none(), auth, async (req, res) => {
  try {
    const users = await User.find().select("-password -__v"); // Récupère tous les utilisateurs
    res.status(200).json(users); // Retourne les utilisateurs en JSON
  } catch (err) {
    console.error(err.message); // Affiche l'erreur dans la console
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The user description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", upload.none(), auth, async (req, res) => {
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

/**
 * @swagger
 * /user/username/{username}:
 *   get:
 *     summary: Get a user by username
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The user username
 *     responses:
 *       200:
 *         description: The user description by username
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/username/:username", upload.none(), auth, async (req, res) => {
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

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.put("/:id", auth, upload.none(), async (req, res) => {
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

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The user was deleted
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", upload.none(), auth, async (req, res) => {
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

/**
 * @swagger
 * /user/{id}/location:
 *   put:
 *     summary: Update user location
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coordinates:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: The user location was updated
 *       500:
 *         description: Internal Server Error
 */
router.put("/:id/location", upload.none(), auth, async (req, res) => {
  try {
    const { coordinates } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { location: { type: "Point", coordinates } },
      { new: true, runValidators: true }
    );
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
