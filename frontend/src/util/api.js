const API_BASE_URL = "http://localhost:9000/api/users";
const AUTH_URL = "http://localhost:9000/api/authenticate";

// Get All Users
export async function getUsers() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error("Failed to fetch users");
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

// Get User by ID
export async function addUser(userData) {
    try {
        console.log("Sending user data:", userData);
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to add user");
        }
        return data;
    } catch (error) {
        console.error("Error adding user:", error.message);
        return null;
    }
}

// Authenticate User
export async function authenticateUser(authData) {
    try {
        console.log("Authenticating user:", authData);
        const response = await fetch(AUTH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(authData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to authenticate user");
        }
        return data;
    } catch (error) {
        console.error("Error authenticating user:", error.message);
        return { error: error.message };
    }
}

// Saves and/or updates Profile Data
export async function saveProfile(profileData, userId) {
    try {
        const response = await fetch(`http://localhost:9000/api/users/${userId}/profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data.profile;
    } catch (error) {
        console.error("Error saving profile:", error.message);
        return null;
    }
}

// Get Profile by User ID
export async function getProfileByUserId(userId) {
    try {
        const response = await fetch(`http://localhost:9000/api/users/${userId}/profile`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch profile");
        }

        return data;
    } catch (error) {
        console.error("Error fetching profile:", error.message);
        return null;
    }
}

export async function getMatchesForUser(userId) {
    try {
        const response = await fetch(`http://localhost:9000/api/matches/${userId}`);
        
        if (response.status === 403) {
            throw new Error("Upgrade your membership to view matches");
        }

        if (response.status === 400) {
            throw new Error("No matches found yet. You might need to update your profile.");
        }
        
        if (!response.ok) {
            throw new Error("Failed to fetch matches");
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error("Matches data is not an array");
        }

        return data; 

    } catch (error) {
        console.error("Error fetching matches:", error);
        return { error: error.message }; 
    }
}

export async function submitRating(ratingData) {
    try {
        const response = await fetch("/api/rate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(ratingData),
            credentials: "include", 
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to submit rating");
        }

        return {
            success: true,
            message: result.message || "Rating submitted successfully",
            data: result,
        };
    } catch (err) {
        console.error("Error submitting rating:", err.message);
        return {
            success: false,
            error: err.message || "Something went wrong",
        };
    }
}
