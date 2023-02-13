const { getMessages } = require("./getMessagesService");
const { storeMessage } = require("./storeMessageService");
const { leaveRoom } = require("../utils");

const CHAT_BOT = 'ChatBot';

module.exports.joinRoom = (socket, data, allUsers) => {
    const { username, room } = data;
    chatRoomUsers = allUsers.filter((user) => user.room === room);
    if (chatRoomUsers.length >= 4) {
        socket.emit('room_full');
        return;
    }
    socket.emit('admit_to_room');
    socket.join(room);

    let __createdtime__ = Date.now();
    
    socket.to(room).emit('receive_message', {
        message: `${username} has joined the chat room`,
        username: CHAT_BOT,
        createdAt: __createdtime__,
    });
    
    socket.emit('receive_message', {
        message: `Welcome ${username}`,
        username: CHAT_BOT,
        createdAt: __createdtime__,
    });
    
    allUsers.push({ id: socket.id, username, room });
    chatRoomUsers = allUsers.filter((user) => user.room === room);
    socket.to(room).emit('chatroom_users', chatRoomUsers);
    socket.emit('chatroom_users', chatRoomUsers);

    getMessages(room)
        .then((last100Messages) => {
            last100Messages = last100Messages.docs;
            last100Messages = last100Messages.map((msg) => {
                return msg.data();
            });
            last100Messages.reverse();
            socket.emit('last_100_messages', last100Messages);
        })
        .catch((err) => console.log(err));
}

module.exports.sendMessage = (io, data) => {
    const { message, username, room, __createdtime__ } = data;
    io.in(room).emit('receive_message', data);
    storeMessage(message, username, room, __createdtime__)
        .then((response) => console.log(response))
        .catch((err) => console.log(err));
}

module.exports.exitRoom = (socket, data, allUsers) => {
    const { username, room } = data;
    socket.leave(room);
    let __createdtime__ = Date.now();
    allUsers = leaveRoom(socket.id, allUsers);
    chatRoomUsers = allUsers.filter((user) => user.room === room);
    socket.to(room).emit('chatroom_users', chatRoomUsers);
    socket.to(room).emit('receive_message', {
        username: CHAT_BOT,
        message: `${username} has left the chat`,
        createdAt: __createdtime__,
    });

    return allUsers;
}

module.exports.disconnect = (socket, user, allUsers) => {
    allUsers = leaveRoom(socket.id, allUsers);
    room = user.room;
    chatRoomUsers = allUsers.filter((user) => user.room === room);
    let __createdtime__ = Date.now();
    socket.to(room).emit('chatroom_users', chatRoomUsers);
    socket.to(room).emit('receive_message', {
        username: CHAT_BOT,
        message: `${user.username} has disconnected from the chat.`,
        createdAt: __createdtime__,
    });

    return allUsers;
}
