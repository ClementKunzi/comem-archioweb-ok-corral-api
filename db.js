// db.js
import { MongoClient } from "mongodb";

const url = "mongodb://localhost:27017/myproject";

let db;

async function connectToDatabase() {
  if (db) return db; // Reutilise la connexion si elle est déjà ouverte

  const client = await MongoClient.connect(url);
  db = client.db();
  console.log("Connected to MongoDB");
  return db;
}

export default connectToDatabase;
