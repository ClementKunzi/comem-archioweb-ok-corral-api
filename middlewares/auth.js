import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import BlacklistToken from "../models/BlacklistToken.js";

dotenv.config();

const auth = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    // Vérifier si le token est dans la liste noire
    const tokenInBlacklist = await BlacklistToken.findOne({ token });
    if (tokenInBlacklist) {
      // Mettre à jour le champ isLoggedIn de l'utilisateur
      const decoded = jwt.decode(token);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId);
        if (user) {
          user.isLoggedIn = false;
          await user.save();
        }
      }
      return res.status(401).json({ error: "Invalid token." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Access denied. User not found." });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    // Si le token est expiré, mettre à jour le champ isLoggedIn de l'utilisateur
    if (err.name === "TokenExpiredError") {
      const decoded = jwt.decode(token);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId);
        if (user) {
          user.isLoggedIn = false;
          await user.save();
        }
      }
      return res.status(401).json({ error: "Token expired." });
    }
    res.status(400).json({ error: "Invalid token." });
  }
};

export default auth;
