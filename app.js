import express from "express";
import createError from "http-errors";
import logger from "morgan";
import connectToDatabase from "./db.js";
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/user.js";
import User from "./models/User.js"; // Importe le modèle User
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3001;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function startServer() {
  try {
    await connectToDatabase();
    console.log("Connected to MongoDB successfully.");

    app.use("/", indexRouter);
    app.use("/user", usersRouter);

    app.use((req, res, next) => {
      next(createError(404));
    });

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
