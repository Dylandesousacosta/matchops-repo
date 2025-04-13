import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { initDatabase, User, insertUsers } from "./modules/db.js";
import bcrypt from "bcrypt";
import { createUser, updateUser } from "./modules/schema.js";

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 9000;

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
); app.use(express.json());

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

        // Calculate average rating
        const totalRatings = user.ratings.length;
        const avgRating = totalRatings ? user.ratings.reduce((sum, r) => sum + r.stars, 0) / totalRatings : null;

        res.status(200).json({
            ...user.profile,
            averageRating: avgRating ? avgRating.toFixed(1) : "Not rated",
            totalRatings
        });
    } catch (error) {
        console.error("Error fetching profile:", error.message);
        res.status(500).json({ error: "Error fetching profile", details: error.message });
    }
});

app.get("/api/matches/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user || !user.profile) {
            return res.status(404).json({ error: "User or user profile not found" });
        }

        // Check if the user is allowed to access matches
        const allowedMemberships = ["Paid"];
        if (!allowedMemberships.includes(user.membershipType.type)) {
            console.error("User does not have permission to view matches:", user.membershipType.type);
            return res.status(403).json({ error: "Upgrade your membership to view matches" });
        }

        const { gender, lookingFor, interests, skills, location } = user.profile;

        // Ensure user has a complete profile
        if (!gender || !lookingFor || !interests || !skills || !location) {
            return res.status(400).json({ error: "Complete your profile to find matches." });
        }

        const matchesQuery = {
            _id: { $ne: user._id }, // Exclude the current user
            "profile.lookingFor": gender, // Match lookingFor
            "profile.location": location, // Match location
            $or: [
                { "profile.interests": { $in: interests } },
                { "profile.skills": { $in: skills } }
            ],
        };

        // Find matches in the database
        const matches = await User.find(matchesQuery);

        console.log("Matches :", matches);
        console.log("Matches Query:", matchesQuery);

        res.status(200).json(matches.length ? matches.map((match) => ({
            _id: match._id,
            username: match.username,
            email: match.email,
            profile: match.profile,
            hasRated: match.ratings?.some(r => r.fromUserId.toString() === user._id.toString())
        })) : []);

    } catch (error) {
        console.error("Error fetching matches:", error);  // Log the error
        res.status(500).json({ error: "Failed to fetch matches", details: error.message });
    }
});

app.post("/api/rate", async (req, res) => {
    const { fromUserId, toUserId, stars, comment } = req.body;

    if (!fromUserId || !toUserId || !stars) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Find the user being rated
        const ratedUser = await User.findById(toUserId);
        if (!ratedUser) return res.status(404).json({ error: "User not found" });

        // Optional: prevent double rating (could use a separate Rating model for more control)
        const alreadyRated = ratedUser.ratings?.find(
            (r) => r.fromUserId.toString() === fromUserId
        );
        if (alreadyRated) return res.status(409).json({ error: "Already rated" });

        // Add the new rating
        ratedUser.ratings.push({ fromUserId, toUserId, stars, comment });
        await ratedUser.save();

        res.status(200).json({ success: true, message: "Rating submitted" });
    } catch (err) {
        console.error("Error submitting rating:", err);
        res.status(500).json({ error: "Server error submitting rating" });
    }
});

// Update User by ID
app.put("/api/users/:id", async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    membershipType: req.body.membershipType,
                    updatedAt: new Date(),
                },
            },
            { new: true }
        );

        if (!updated) return res.status(404).json({ error: "User not found" });

        res.status(200).json({ message: "User updated", user: updated });
    } catch (error) {
        console.error("Update user failed:", error.message);
        res.status(500).json({ error: "Failed to update user", details: error.message });
    }
});

// Catch-all Route for 404 Errors
app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

// Export Express App (For Testing Purposes)
export default app;