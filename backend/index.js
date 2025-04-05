import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { initDatabase, User, insertUsers } from "./modules/db.js";
import bcrypt from "bcrypt";
import { createUser, updateUser } from "./modules/schema.js";

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 9000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

// Connect to MongoDB using Mongoose
initDatabase()
    .then(async () => {
        console.log("MongoDB Connected Successfully");
        await insertUsers();
        app.listen(port, () => console.log(`Server running on port ${port}`));
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1); // Stop server if DB connection fails
    });

// Default Route
app.get("/", (req, res) => {
    res.send("Hello World! Backend is running!");
});

// Get All Users
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find({}, "_id username email membershipType");
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ error: "Failed to fetch users", details: error.message });
    }
});

// Create New User
app.post("/api/users", async (req, res) => {
    try {
        // Use `createUser` to generate a user object
        const newUser = await createUser(req.body);

        // Check if user already exists
        const existingUser = await User.findOne({ username: newUser.username });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Save user in the database
        const savedUser = await new User(newUser).save();

        res.status(201).json({
            message: "User created successfully",
            user: { _id: savedUser._id, username: savedUser.username, email: savedUser.email }
        });

    } catch (error) {
        console.error("Failed to add user:", error.message);
        res.status(500).json({ error: "Failed to add user", details: error.message });
    }
});


// Authenticate User
app.post("/api/authenticate", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        res.status(200).json({ message: "User authenticated successfully" });

    } catch (error) {
        console.error("Authentication failed:", error.message);
        res.status(500).json({ error: "Error authenticating user", details: error.message });
    }
});

// Get User by ID
app.get("/api/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id, "_id username email");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error.message);
        res.status(500).json({ error: "Failed to fetch user", details: error.message });
    }
});

// Save or update User by ID
app.post("/api/users/:id/profile", async (req, res) => {
    try {
        const { id } = req.params;
        const profileFields = req.body;

        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.profile = profileFields;
        user.updatedAt = new Date();
        
        await user.save();

        res.status(200).json({
            message: user.profile ? "Profile updated" : "Profile saved successfully",
            profile: user.profile
        });

    } catch (error) {
        console.error("Error saving profile:", error.message);
        res.status(500).json({ error: "Failed to save profile", details: error.message });
    }
});

// Get User Profile by ID
app.get("/api/users/:id/profile", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.profile) {
            return res.status(404).json({ error: "Profile not found" });
        }

        res.status(200).json(user.profile);
    } catch (error) {
        console.error("Error fetching profile:", error.message);
        res.status(500).json({ error: "Error fetching profile", details: error.message });
    }
});

// Catch-all Route for 404 Errors
app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

// Export Express App (For Testing Purposes)
export default app;