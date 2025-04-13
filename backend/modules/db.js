import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import fs from "fs/promises";
import path from "path";

dotenv.config();

// Initialize MongoDB connection
const initDatabase = async () => {
    const { DB_USER, DB_PASSWORD, DB_ADDRESS, DB_NAME } = process.env;
    const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_ADDRESS}/${DB_NAME}?retryWrites=true&w=majority`;
    try {
        await mongoose.connect(uri);
        console.warn(`Connected to MongoDB ${DB_NAME} database.`);
    } catch (e) {
        console.error(`Error connecting to MongoDB: ${e.message}`);
        process.exit(1);
    }
};

// Define User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    membershipType: {
        type: { type: String, enum: ["Free", "Paid"], default: "Free" },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date, default: null }
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profile: {
        bio: String,
        age: Number,
        gender: String,
        lookingFor: String,
        interests: [String],
        location: String,
        skills: [String]
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    ratings: [
        {
          fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          stars: { type: Number, required: true },
          comment: { type: String },
          ratedAt: { type: Date, default: Date.now }
        }
      ]
});

const User = mongoose.model("User", userSchema);

// Insert Users into MongoDB using JSON file
const insertUsers = async () => {
    try {
        // Read users from JSON file
        const filePath = path.resolve("data/users.json");
        const content = await fs.readFile(filePath, "utf-8");
        const users = JSON.parse(content);

        // Check if users already exist in the database
        const existing = await User.find();
        if (existing.length > 0) {
            console.log("Users already exist. Skipping insertion.");
            return;
        }

        // Hash passwords and insert users
        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const newUser = new User({
                username: user.username,
                email: user.email,
                passwordHash: hashedPassword,
                firstName: user.firstName,
                lastName: user.lastName,
                membershipType: {
                    type: user.type,
                    startDate: new Date(),
                    endDate: user.type === "Paid" ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) : null
                },
                role: user.role || "user", // <-- This sets "admin" if present, else defaults to "user"
                createdAt: new Date(),
                updatedAt: new Date()
            });

            //Save user in the database
            await newUser.save();
            console.log(`Added: ${user.username}`);
        }

    } catch (err) {
        console.error("Error loading users:", err.message);
    }
};

export { initDatabase, User, insertUsers };