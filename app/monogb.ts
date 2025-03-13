import mongoose from "mongoose";

class MongoDB {
  public url: string;

  constructor() {
    this.url = process.env.MONGO_TEST_URI ?? "";
  }

  public async connect(): Promise<void> {
    try {
      await mongoose.connect(this.url);
      console.log("Database connection successful");
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Connection to MongoDB failed:", error);
      throw new Error("Connection to MongoDB failed");
    }
  }
}

export default MongoDB;
