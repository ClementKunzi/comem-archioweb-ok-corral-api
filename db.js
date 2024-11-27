import mongoose from "mongoose";

async function connectToDatabase() {
  const uri = "mongodb://127.0.0.1:27017/mydatabase"; // Remplace par ton URI
  await mongoose.connect(uri);
  console.log("Connected to MongoDB successfully.");
}

export default connectToDatabase;
