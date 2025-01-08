import express from "express";
import createError from "http-errors";
import logger from "morgan";
import cors from "cors";
import multer from "multer";
import connectToDatabase from "./db.js";
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/user.js";
import sessionsRouter from "./routes/session.js";
import gamesRouter from "./routes/Game.js";
import swaggerRouter from "./swagger.js"; // Importer le routeur Swagger
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3001;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const upload = multer();

async function startServer() {
  try {
    await connectToDatabase();
    console.log("Connected to MongoDB successfully.");

    app.use("/", indexRouter);
    app.use("/user", usersRouter);
    app.use("/session", sessionsRouter);
    app.use("/game", gamesRouter);
    app.use("/api-docs", swaggerRouter); // Utilisez le routeur Swagger

    // Gestion des erreurs 404
    app.use((req, res, next) => {
      next(createError(404));
    });

    // Gestion des erreurs
    app.use((err, req, res, next) => {
      console.error("Error encountered:", err.stack);
      res.locals.message = err.message;
      res.locals.error = req.app.get("env") === "development" ? err : {};
      res.status(err.status || 500);
      res.send(err.message);
    });

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
}

startServer();

export default app;
