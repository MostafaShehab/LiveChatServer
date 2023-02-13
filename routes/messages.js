const express = require('express');
const router = express.Router();

// Import appropriate controllers
const { getMessages } = require('../controllers/messagesController');

router.get('/getMessages', getMessages)

module.exports = router;
