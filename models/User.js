import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePhoto: {
    type: String, // Chemin vers la photo de profil
  },
  location: {
    type: { type: String, enum: ["Point"], required: false },
    coordinates: { type: [Number], required: false },
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
});
UserSchema.index({ location: "2dsphere" });
const User = mongoose.model("User", UserSchema);
export default User;
