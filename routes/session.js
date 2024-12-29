import express from "express";
import auth from "../middlewares/auth.js";
import Session from "../models/Session.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       required:
 *         - userId
 *         - gameId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the session
 *         userId:
 *           type: string
 *           description: The ID of the user who created the session
 *         gameId:
 *           type: string
 *           description: The ID of the game associated with the session
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the session was created
 *         closed_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the session was closed
 *       example:
 *         id: d5fE_asz
 *         userId: 60d5f9b5f8d2c72b8c8e4b8e
 *         gameId: 60d5f9b5f8d2c72b8c8e4b8f
 *         created_at: 2023-10-01T10:00:00.000Z
 *         closed_at: 2023-10-01T12:00:00.000Z
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Session'
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
router.post("/", auth, async (req, res) => {
  try {
    const session = new Session(req.body);
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
router.get("/", auth, async (req, res) => {
  try {
    const sessions = await Session.find();
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
router.patch("/close/:id", auth, async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { closed_at: Date.now() },
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

export default router;
