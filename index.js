require("dotenv").config();
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');

const { Server } = require('socket.io');
const { initializeApp, cert } = require('firebase-admin/app');

const { sendMessage, joinRoom, exitRoom, disconnect } = require('./services');

var messagesRouter = require('./routes/messages');

const serviceAccount = {
    "type": process.env.TYPE,
    "project_id": process.env.PROJECT_ID,
    "private_key_id": process.env.PRIVATE_KEY_ID,
    "private_key": process.env.PRIVATE_KEY,
    "client_email": process.env.CLIENT_EMAIL,
    "client_id": process.env.CLIENT_ID,
    "auth_uri": process.env.AUTH_URI,
    "token_uri": process.env.TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL,
};

initializeApp({
    credential: cert(serviceAccount)
});

app.use(cors());
app.use("/messages", messagesRouter);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: true,
        methods: ['GET', 'POST'],
    },
});

let allUsers = [];

io.on('connection', (socket) => {
    socket.on('join_room', (data) => {
        joinRoom(socket, data, allUsers);
    });

    socket.on('send_message', (data) => {
        sendMessage(io, data);
    });

    socket.on('leave_room', (data) => {
        allUsers = exitRoom(socket, data, allUsers);
    });

    socket.on('disconnect', () => {
        let user = allUsers.find((user) => user.id == socket.id);
        if (user?.username) {
            allUsers = disconnect(socket, user, allUsers);
        }
    });
});

server.listen(4000, () => 'Server is running on port 4000');
