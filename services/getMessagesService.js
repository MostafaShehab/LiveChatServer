const admin = require("firebase-admin");

module.exports.getMessages = async (room) => {
    const docRef = admin.firestore().collection('messages').where('room', '==', room).orderBy('createdAt', 'desc').limit(100);

    return docRef.get();
}
