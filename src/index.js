const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const { createUser, updateUser } = require('./schema');

// Initialize Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// MongoDB client setup
const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Connect to MongoDB and setup routes
async function main() {
    await client.connect(); // Connect to the MongoDB server
    console.log("Connected successfully to MongoDB");

    // Define the database and collection
    const database = client.db("LookingForLoveDB"); // assuming the database name
    const users = database.collection("users"); // assuming we are calling the collection users

    // Route to create a new user
    app.post('/users', async (req, res) => {
        try {
            const newUser = createUser(req.body); // Create user using the schema defined function
            const result = await users.insertOne(newUser);
            res.status(201).json(result);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // Route to get all users
    app.get('/users', async (req, res) => {
        try {
            const userList = await users.find({}).toArray();
            res.status(200).json(userList);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // Route to get a single user by ID
    app.get('/users/:id', async (req, res) => {
        try {
            const result = await users.findOne({ _id: new ObjectId(req.params.id) });
            result ? res.status(200).json(result) : res.status(404).json({ error: "User not found" });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // Route to update a user
    app.put('/users/:id', async (req, res) => {
        try {
            const updateDocument = updateUser(req.body); // Update user using the schema defined function
            const result = await users.updateOne({ _id: new ObjectId(req.params.id) }, updateDocument);
            result.modifiedCount === 1 ? res.status(200).json(result) : res.status(404).json({ error: "No changes made or user not found" });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // Route to delete a user
    app.delete('/users/:id', async (req, res) => {
        try {
            const result = await users.deleteOne({ _id: new ObjectId(req.params.id) });
            result.deletedCount === 1 ? res.status(204).send() : res.status(404).json({ error: "User not found" });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // Start the server on the specified port
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
}

// Handle errors in the main function
main().catch(console.error);
