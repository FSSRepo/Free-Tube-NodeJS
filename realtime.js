const {Server} = require('socket.io');

module.exports = {
    setupRealtime: (server) => {
        const io = new Server(server);
        io.on('connection',socket => {
            console.log("User Connected: "+socket.id);
            socket.on('disconnect', reason => {
                console.log("User Disconnected: "+ reason);
            });
            socket.on('req-update-videolist',msg => {
                socket.broadcast.emit('update-videolist');
            });
        });
    }
}