import mongoose from "mongoose";

const DuelSchema = new mongoose.Schema({
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
  },
  status: {
    type: String,
    enum: ["open", "closed", "pending"],
    default: "pending",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  closed_at: { type: Date },
});
const Duel = mongoose.model("Duel", DuelSchema);
export default Duel;
