const admin = require("firebase-admin");

module.exports.storeMessage = async (message, username, room, createdAt) => {
    const docRef = admin.firestore().collection('messages').doc();

    return docRef.set({
        username: username,
        message: message,
        room: room,
        createdAt: createdAt,
    });
}
