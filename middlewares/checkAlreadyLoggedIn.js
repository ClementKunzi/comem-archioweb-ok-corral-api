import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const checkAlreadyLoggedIn = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user) {
        return res.status(400).json({ error: "User already logged in" });
      }
    } catch (err) {
      // Token invalide ou expiré, continuer avec la connexion
    }
  }
  next();
};

export default checkAlreadyLoggedIn;
