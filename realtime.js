import {Server} from 'socket.io';

export const setupRealtime = (server) => {
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