var Socket = function () {
    this.client = io();
};

Socket.prototype.emit = function (event, data) {
    this.client.emit(event, data);
};

Socket.prototype.on = function (event, func) {
    this.client.on(event, func);
};