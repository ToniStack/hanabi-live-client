// Imports
const client = require('socket.io-client');
const discord = require('./discord');

// Import the environment variables defined in the ".env" file
// (this has to be in every file that accesses any environment varaibles)
require('dotenv').config();

// Configuration
const url = 'http://keldon.net:32221/';
const username = process.env.KELDON_USER;
const password = process.env.KELDON_PASS;

// Local variables
let socket = null;

// Only connect if the user has specified values in the .env file
if (username.length > 0 && password.length > 0) {
    socket = client.connect(url);

    socket.emit('message', {
        type: 'login',
        resp: {
            username,
            password,
        },
    });

    /*
        SocketIO callbacks
    */

    // Look for chat messages
    // E.g. { type: 'chat', resp: { who: 'Zamiel', msg: 'hi' } }
    socket.on('message', keldonMessage);
}

function keldonMessage(msg) {
    /*
    // Uncomment this when debugging
    console.log('Received a Keldon message:');
    console.log(msg);
    */

    // Validate that the message has a type
    if (!('type' in msg)) {
        return;
    }

    // We only care about chat messages
    // (there are other types of messages, such when people create a new table, and so forth)
    if (msg.type !== 'chat') {
        return;
    }

    if (!('resp' in msg)) {
        return;
    }

    if (!('who' in msg.resp)) {
        return;
    }

    if (msg.resp.who === null) {
        // Filter out server messages
        // E.g. "Welcome to Hanabi"
        return;
    }

    if (typeof msg.resp.who !== 'string') {
        return;
    }

    if (msg.resp.who.length === 0) {
        return;
    }

    if (msg.resp.who === process.env.KELDON_USER) {
        // Filter out messages from ourselves
        return;
    }

    if (!('msg' in msg.resp)) {
        return;
    }

    if (typeof msg.resp.msg !== 'string') {
        return;
    }

    if (msg.resp.msg.length === 0) {
        return;
    }

    discord.send('Keldon', msg.resp.who, msg.resp.msg);
}

exports.sendChat = (msg) => {
    if (socket === null) {
        return;
    }

    // Note that we can send the message, but none of the other users in the
    // lobby will receive our text because the IP address that is currently
    // hosting the server is banned
    socket.emit('message', {
        type: 'chat',
        resp: {
            msg,
        },
    });
};
