import express from "express";
import auth from "../middlewares/auth.js";
import Session from "../models/Session.js";

const router = express.Router();

// Create a new session
router.post("/", async (req, res) => {
  try {
    const session = new Session(req.body);
    await session.save();
    res.status(201).json({ message: "Session successfully created", session });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all sessions
router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find();
    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Close a session
router.patch("/close/:id", async (req, res) => {
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
