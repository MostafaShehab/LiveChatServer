module.exports.leaveRoom = (userID, chatRoomUsers) => {
    return chatRoomUsers.filter((user) => user.id != userID);
}