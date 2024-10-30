import express from "express";
import createError from "http-errors";
import logger from "morgan";
import connectToDatabase from "./db.js";

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";

const app = express();
const port = 3001;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Ajout d'une fonction pour se connecter à MongoDB
async function startServer() {
  try {
    // Connect to the database
    const db = await connectToDatabase();
    console.log("Connected to MongoDB successfully.");

    // Ajout des routes après la connexion réussie
    app.use("/", indexRouter);
    app.use("/users", usersRouter);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      next(createError(404));
    });

    // error handler
    app.use(function (err, req, res, next) {
      res.locals.message = err.message;
      res.locals.error = req.app.get("env") === "development" ? err : {};
      res.status(err.status || 500);
      res.send(err.message);
    });

    // Start the server only after the database connection is successful
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1); // Arrêter le processus si la connexion échoue
  }
}

startServer(); // Démarre le serveur après connexion MongoDB réussie

export default app;
