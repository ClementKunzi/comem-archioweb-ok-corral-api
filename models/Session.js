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
  session_code: {
    type: String,
    unique: true,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  team1id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  team2id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  status: {
    type: String,
    enum: ["open", "closed", "pending"],
    default: "pending",
  },
});
SessionSchema.pre("save", function (next) {
  if (!this.session_code) {
    this.session_code = Math.floor(100000 + Math.random() * 900000).toString(); // Génère un code de 6 chiffres
  }
  next();
});
const Session = mongoose.model("Session", SessionSchema);
export default Session;
