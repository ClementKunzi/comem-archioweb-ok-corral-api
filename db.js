import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectToDatabase() {
  const uri = process.env.DATABASE_URL; // Utilise la variable d'environnement
  await mongoose.connect(uri);
  console.log("Connected to MongoDB successfully.");
}

export default connectToDatabase;
