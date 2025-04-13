//const { ObjectId } = require('mongodb');
import bcrypt from "bcrypt";

// Function to Create a New User
async function createUser({ username, email, password, firstName, lastName, type = "Free", role = "user" }) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    return {
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        role, // Default will be "user", can be set to "admin"
        membershipType: {
            type,
            startDate: new Date(),
            endDate: type === "Paid" ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) : null
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

// Function to Update a User
function updateUser({ firstName, lastName, email, membershipType, role }) {
    const updateFields = {
        updatedAt: new Date(),
    };

    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;

    if (membershipType) {
        if (membershipType.type && ["Free", "Paid"].includes(membershipType.type)) {
            updateFields["membershipType.type"] = membershipType.type;
            updateFields["membershipType.startDate"] = new Date(membershipType.startDate || new Date());
            updateFields["membershipType.endDate"] =
                membershipType.type === "Paid"
                    ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                    : null;
        }
    }

    return { $set: updateFields };
}

export { createUser, updateUser };