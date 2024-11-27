import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
  created_at: {
    type: Date,
    default: Date.now,
  },
  closed_at: { type: Date },
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
  game_mode_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GameMode",
    required: true,
  },
  team_1_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  team_2_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
});
const Game = mongoose.model("Game", GameSchema);
export default Game;
