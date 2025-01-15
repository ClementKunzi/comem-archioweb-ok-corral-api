import express from "express";
import auth from "../middlewares/auth.js";
import Session from "../models/Session.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       required:
 *         - game_id
 *         - session_code
 *         - team1id
 *         - team2id
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the session
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the session was created
 *         closed_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the session was closed
 *         game_id:
 *           type: string
 *           description: The ID of the game associated with the session
 *         session_code:
 *           type: string
 *           description: The unique code of the session
 *         user:
 *           type: string
 *           description: The ID of the user who created the session
 *         team1id:
 *           type: string
 *           description: The ID of team 1
 *         team2id:
 *           type: string
 *           description: The ID of team 2
 *         status:
 *           type: string
 *           enum: [open, closed, pending]
 *           description: The status of the session
 *       example:
 *         id: "60d5f9b5f8d2c72b8c8e4b8e"
 *         created_at: "2023-10-01T12:00:00Z"
 *         closed_at: null
 *         game_id: "60d5f9b5f8d2c72b8c8e4b8e"
 *         session_code: "ABC123"
 *         user: "60d5f9b5f8d2c72b8c8e4b90"
 *         team1id: "60d5f9b5f8d2c72b8c8e4b91"
 *         team2id: "60d5f9b5f8d2c72b8c8e4b92"
 *         status: "open"
 */

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: The sessions managing API
 */

/**
 * @swagger
 * /session:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: The session was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       400:
 *         description: Bad request
 */
router.post("/", upload.none(), auth, async (req, res) => {
  try {
    const session = new Session({
      ...req.body,
      user: req.user._id, // Ajoute l'utilisateur actuel comme user
    });
    await session.save();
    res.status(201).json({ message: "Session successfully created", session });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /session:
 *   get:
 *     summary: Get all sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Session'
 *       500:
 *         description: Internal Server Error
 */
router.get("/", upload.none(), auth, async (req, res) => {
  try {
    const sessions = await Session.find().populate("user", "-password -__v"); // Remplit le champ admin avec les informations de l'utilisateur sans le mot de passe et __v
    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /session/close/{id}:
 *   patch:
 *     summary: Close a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The session ID
 *     responses:
 *       200:
 *         description: The session was successfully closed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal Server Error
 */
router.patch("/close/:id", upload.none(), auth, async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { closed_at: Date.now(), status: "closed" },
      { new: true, runValidators: true }
    );
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.status(200).json({ message: "Session successfully closed", session });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /session/validate/{code}:
 *   get:
 *     summary: Validate a session code
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: The session code
 *     responses:
 *       200:
 *         description: The session code is valid and the session is open
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 session:
 *                   $ref: '#/components/schemas/Session'
 *       400:
 *         description: Invalid session code
 *       404:
 *         description: Session not found or closed
 */
router.get("/validate/:code", async (req, res) => {
  try {
    const session = await Session.findOne({ session_code: req.params.code });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.status !== "open") {
      return res.status(404).json({ error: "Session is closed" });
    }

    res.status(200).json({
      message: "Session code is valid and the session is open",
      session,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
