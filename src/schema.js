const { ObjectId } = require('mongodb');

function createUser({
    username,
    email,
    passwordHash,
    firstName,
    lastName,
    type = 'Free', // Default to 'Free' if not specified
    startDate = new Date(),
    endDate = null
}) {
    return {
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        membershipType: {
            type,
            startDate,
            endDate
        },
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

function updateUser({
    firstName,
    lastName,
    email,
    updatedData,
    membershipType
}) {
    return {
        $set: {
            firstName,
            lastName,
            email,
            ...updatedData,
            "membershipType.type": membershipType.type,
            "membershipType.startDate": new Date(membershipType.startDate),
            "membershipType.endDate": membershipType.endDate,
            updateAt: new Date()
        }
    };
}

module.exports = { createUser, updateUser };