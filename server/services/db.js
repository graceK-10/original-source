import mongoose from "mongoose";

let connectPromise = null;

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectPromise) {
    return connectPromise;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  connectPromise = mongoose
    .connect(uri)
    .then((conn) => {
      console.log("MongoDB connected");
      return conn.connection;
    })
    .finally(() => {
      connectPromise = null;
    });

  return connectPromise;
}