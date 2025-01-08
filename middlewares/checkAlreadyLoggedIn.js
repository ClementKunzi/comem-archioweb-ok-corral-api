import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import BlacklistToken from "../models/BlacklistToken.js";

dotenv.config();

const checkAlreadyLoggedIn = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      const tokenInBlacklist = await BlacklistToken.findOne({ token });
      if (tokenInBlacklist) {
        return res.status(400).json({ error: "Invalid token." });
      }

      if (user && user.isLoggedIn) {
        return res
          .status(400)
          .json({ error: "User already logged in on another session." });
      }
    } catch (err) {
      // Token invalide ou expiré
    }
  }
  next();
};

export default checkAlreadyLoggedIn;
