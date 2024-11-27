import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  closed_at: { type: Date },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});
const Team = mongoose.model("Team", TeamSchema);
export default Team;
