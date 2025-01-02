import express from "express";
import auth from "../middlewares/auth.js";
import Game from "../models/Games.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       required:
 *         - session_id
 *         - game_mode_id
 *         - team_1_id
 *         - team_2_id
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the game
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the game was created
 *         closed_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the game was closed
 *         session_id:
 *           type: string
 *           description: The ID of the session associated with the game
 *         game_mode_id:
 *           type: string
 *           description: The ID of the game mode associated with the game
 *         team_1_id:
 *           type: string
 *           description: The ID of team 1
 *         team_2_id:
 *           type: string
 *           description: The ID of team 2
 *       example:
 *         id: d5fE_asz
 *         created_at: 2023-10-01T10:00:00.000Z
 *         closed_at: 2023-10-01T12:00:00.000Z
 *         session_id: 60d5f9b5f8d2c72b8c8e4b8e
 *         game_mode_id: 60d5f9b5f8d2c72b8c8e4b8f
 *         team_1_id: 60d5f9b5f8d2c72b8c8e4b90
 *         team_2_id: 60d5f9b5f8d2c72b8c8e4b91
 */

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: The games managing API
 */

/**
 * @swagger
 * /game:
 *   post:
 *     summary: Create a new game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Game'
 *     responses:
 *       201:
 *         description: The game was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       400:
 *         description: Bad request
 */
router.post("/", auth, async (req, res) => {
  try {
    const game = new Game({ ...req.body, userId: req.user.userId });
    await game.save();
    res.status(201).json({ message: "Game successfully created", game });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /game:
 *   get:
 *     summary: Get all games
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: The name of the game
 *       - in: query
 *         name: game_mode_id
 *         schema:
 *           type: string
 *         description: The ID of the game mode
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items per page
 *     responses:
 *       200:
 *         description: The list of games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 games:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       500:
 *         description: Internal Server Error
 */
router.get("/", auth, async (req, res) => {
  const { name, game_mode_id, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (name) filter.name = name;
  if (game_mode_id) filter.game_mode_id = game_mode_id;

  try {
    const games = await Game.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Game.countDocuments(filter);
    res.status(200).json({
      games,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /game/{id}:
 *   put:
 *     summary: Update a game by ID
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The game ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Game'
 *     responses:
 *       200:
 *         description: The game was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Game not found
 *       500:
 *         description: Internal Server Error
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    if (game.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    Object.assign(game, req.body);
    await game.save();
    res.status(200).json(game);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /game/{id}:
 *   delete:
 *     summary: Delete a game by ID
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The game ID
 *     responses:
 *       200:
 *         description: The game was deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Game not found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    if (game.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await game.deleteOne();
    res.status(200).json({ message: "Game successfully deleted" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /game/stats:
 *   get:
 *     summary: Get game statistics
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The game statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   totalGames:
 *                     type: integer
 *       500:
 *         description: Internal Server Error
 */
router.get("/stats", auth, async (req, res) => {
  try {
    const stats = await Game.aggregate([
      { $group: { _id: "$game_mode_id", totalGames: { $sum: 1 } } },
    ]);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /game/result:
 *   post:
 *     summary: Calculate the winner of a game
 *     tags: [Games]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameId:
 *                 type: string
 *                 description: The ID of the game
 *               team1Id:
 *                 type: string
 *                 description: The ID of team 1
 *               team2Id:
 *                 type: string
 *                 description: The ID of team 2
 *               team1Timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: The timestamp of team 1's button press
 *               team2Timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: The timestamp of team 2's button press
 *     responses:
 *       200:
 *         description: The winner was calculated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 winnerId:
 *                   type: string
 *                   description: The ID of the winning team
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 */
router.post("/result", async (req, res) => {
  const { gameId, team1Id, team2Id, team1Timestamp, team2Timestamp } = req.body;

  if (!gameId || !team1Id || !team2Id || !team1Timestamp || !team2Timestamp) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const winnerId =
      new Date(team1Timestamp) < new Date(team2Timestamp) ? team1Id : team2Id;

    res.status(200).json({ winnerId });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
