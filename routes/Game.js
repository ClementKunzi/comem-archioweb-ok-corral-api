import express from "express";
import auth from "../middlewares/auth.js";
import Game from "../models/Game.js";

const router = express.Router();

// Create a new game
router.post("/", async (req, res) => {
  try {
    const game = new Game(req.body);
    await game.save();
    res.status(201).json({ message: "Game successfully created", game });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all games
router.get("/", async (req, res) => {
  try {
    const games = await Game.find();
    res.status(200).json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
