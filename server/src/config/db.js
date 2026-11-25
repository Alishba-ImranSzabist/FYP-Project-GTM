import mongoose from "mongoose";
import { env } from "./env.js";

let connectionPromise;

export function connectDB() {
  connectionPromise ??= openConnection().catch((error) => {
    connectionPromise = undefined;
    throw error;
  });
  return connectionPromise;
}

async function openConnection() {
  mongoose.set("strictQuery", true);
  const mongoUri = new URL(env.mongoUri);
  if (
    mongoUri.protocol === "mongodb+srv:" &&
    !mongoUri.searchParams.has("authSource")
  ) {
    mongoUri.searchParams.set("authSource", "admin");
  }
  await mongoose.connect(mongoUri.toString());
  console.log(
    `MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`,
  );
}
