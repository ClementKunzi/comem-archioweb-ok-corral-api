import mongoose from "mongoose";

const DuelSchema = new mongoose.Schema({
  user_1_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user_2_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  game_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    required: true,
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
const Duel = mongoose.model("Duel", DuelSchema);
export default Duel;
