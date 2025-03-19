import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
//import fs from "fs/promises";
//import path from "path";

dotenv.config();

// Initialize MongoDB connection
const initDatabase = async () => {
    const { DB_USER, DB_PASSWORD, DB_ADDRESS, DB_CLUSTER, DB_NAME } = process.env;
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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (this.isModified("passwordHash") || this.isNew) {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
    next();
});

const User = mongoose.model("User", userSchema);

//  Users
const users = [
    { username: "johndoe", email: "johndoe@email.com", firstName: "John", lastName: "Doe", password: "password123", membershipType: { type: "Free" } },
    { username: "janedoe", email: "janedoe@email.com", firstName: "Jane", lastName: "Doe", password: "password123", membershipType: { type: "Paid" } },
    { username: "batman", email: "batman@email.com", firstName: "Bruce", lastName: "Wayne", password: "password123", membershipType: { type: "Free" } },
    { username: "superman", email: "superman@email.com", firstName: "Clark", lastName: "Kent", password: "password123", membershipType: { type: "Paid" } },
    { username: "spiderman", email: "spiderman@email.com", firstName: "Peter", lastName: "Parker", password: "password123", membershipType: { type: "Free" } },
    { username: "wonderwoman", email: "wonderwoman@email.com", firstName: "Diana", lastName: "Prince", password: "password123", membershipType: { type: "Paid" } },
    { username: "hulk", email: "hulk@email.com", firstName: "Bruce", lastName: "Banner", password: "password123", membershipType: { type: "Free" } },
    { username: "ironman", email: "ironman@email.com", firstName: "Tony", lastName: "Stark", password: "password123", membershipType: { type: "Paid" } },
    { username: "thor", email: "thor@email.com", firstName: "Thor", lastName: "Odinson", password: "password123", membershipType: { type: "Free" } },
    { username: "captainamerica", email: "captain@email.com", firstName: "Steve", lastName: "Rogers", password: "password123", membershipType: { type: "Paid" } }
];

// Insert Users into MongoDB
const insertUsers = async () => {
    try {
        const existingUsers = await User.find();
        if (existingUsers.length === 0) {
            // Hash passwords
            for (let user of users) {
                const salt = await bcrypt.genSalt(10);
                user.passwordHash = await bcrypt.hash(user.password, salt);
                delete user.password; // Remove plain text password
            }

            await User.insertMany(users);
            console.log("Users Added Successfully!");
        } else {
            console.log("Users already exist in database. Skipping user insertion.");
        }
    } catch (error) {
        console.error("Error inserting users:", error.message);
    }
};

// Function to Import Users from JSON
/*const importUsers = async () => {
    try {
        const filePath = path.resolve("data/users.json");
        const fileContent = await fs.readFile(filePath, "utf8");
        const users = JSON.parse(fileContent);

        for (const user of users) {
            const existingUser = await User.findOne({ email: user.email });

            if (!existingUser) {
                const passwordHash = await bcrypt.hash(user.password, 10);
                await User.create({
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    passwordHash,
                    membershipType: {
                        type: user.type,
                        startDate: new Date(),
                        endDate: user.type === "Paid" ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) : null
                    }
                });
                console.log(`User ${user.username} added.`);
            } else {
                console.log(`User ${user.username} already exists. Skipping.`);
            }
        }
    } catch (error) {
        console.error("Failed to import users:", error.message);
    }
};*/

export { initDatabase, User, insertUsers };