import mongoose from "mongoose";
const GameModeSchema = new mongoose.Schema({
  game_name: {
    type: String,
    required: true,
  },
  game_winning_rounds: {
    type: Number,
    required: true,
  },
  game_rounds: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});
const GameMode = mongoose.model("GameMode", GameModeSchema);
export default GameMode;
