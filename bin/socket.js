var token = require("rand-token");

var SocketIO = function (opts) {
    this.io = opts.io;

    this.sockets = {};

    this.rooms = {};
    this.roomsUsers = {};
    this.roomStatus = {};

    var self = this;
    this.io.on("connection", function (socket) {
        self.addEventListeners(socket);
    });
};

SocketIO.prototype.addEventListeners = function (socket) {
    var self = this;

    socket.on("START_NEW_GAME", function (data) {
        var uniqueToken = token.generate(6).toUpperCase();
        self.createRoom(socket, uniqueToken, data);
    });

    socket.on("JOIN_GAME", function (data) {
        if (!self.roomsUsers[data.token]) {
            return;
        }

        if (self.roomsUsers[data.token].length === 4) {
            return socket.emit("GAME_FULL");
        }

        socket.emit("UPDATE_ROOM", self.roomsUsers[data.token]);

        self.joinRoom(socket, data);
    });

    socket.on("BOTTLE_MOVE", function (data) {
        socket.broadcast.to(data.token).emit("BOTTLE_MOVE", {rotation: data.rotation});
    });

    socket.on("ROTATE_BOTTLE", function (data) {
        socket.broadcast.to(data.token).emit("ROTATE_BOTTLE", {rotation: data.rotation});
    });

    socket.on("PLAYER_SELECTED", function (data) {

        if (self.roomStatus[data.token]) {
            return;
        }

        self.roomStatus[data.token] = true;

        var room = self.roomsUsers[data.token];

        var roomUpdated = [];
        room.forEach(function (player) {
            if (player.username !== data.username) {
                roomUpdated.push(player);
            }
        });

        var randomPlayer = roomUpdated[Math.floor(Math.random() * roomUpdated.length)];
        var socket = self.sockets[randomPlayer.username];
        socket.emit("ASK_QUESTION");
    });

    socket.on("QUESTION_SUBMITTED", function (data) {
        self.io.in(data.token).emit('QUESTION_SUBMITTED', data);
    });

    socket.on("ANSWER_SUBMITTED", function (data) {
        self.roomStatus[data.token] = false;
        self.io.in(data.token).emit('ANSWER_SUBMITTED', data);
    });

    socket.on("SPINNING_PLAYER", function (data) {
        self.io.in(data.token).emit('SPINNING_PLAYER', data);
    });
};

SocketIO.prototype.createRoom = function (socket, uniqueToken, data) {
    this.rooms[uniqueToken] = this.rooms[uniqueToken] || {};
    this.rooms[uniqueToken][socket.id] = socket;

    this.roomsUsers[uniqueToken] = this.roomsUsers[uniqueToken] || [];
    this.roomsUsers[uniqueToken].push(data);

    this.sockets[data.username] = socket;

    socket.join(uniqueToken);
    socket.emit("ROOM_CREATED", {token: uniqueToken, url: "https://spin-the-bottle-nko.herokuapp.com?join=" + uniqueToken});

    this.io.to(uniqueToken).emit("ADD_PLAYER", data);
};

SocketIO.prototype.joinRoom = function (socket, data) {
    this.roomsUsers[data.token] = this.roomsUsers[data.token] || [];
    this.roomsUsers[data.token].push(data);

    this.sockets[data.username] = socket;

    socket.join(data.token);
    this.io.to(data.token).emit("ADD_PLAYER", data);

    if (this.roomsUsers[data.token].length === 4) {
        this.io.to(data.token).emit("GAME_START", {username: this.roomsUsers[data.token][0].username});
    }
};

module.exports = SocketIO;