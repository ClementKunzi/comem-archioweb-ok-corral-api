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
    required: false,
  },
  game_mode_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GameMode",
    required: false,
  },
  team_1_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: false,
  },
  team_2_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: false,
  },
});
const Game = mongoose.model("Game", GameSchema);
export default Game;
