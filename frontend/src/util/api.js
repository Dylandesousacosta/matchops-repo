const API_BASE_URL = "http://localhost:9000/api/users";
const AUTH_URL = "http://localhost:9000/api/authenticate"; 


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
