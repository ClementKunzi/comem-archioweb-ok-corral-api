import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  created_at: {
    type: Date,
    default: Date.now,
  },
  closed_at: { type: Date },
  game_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
  },
});
const Session = mongoose.model("Session", SessionSchema);
export default Session;
