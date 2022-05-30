// Setting Server Listener
const port = 3000;
const host = "192.168.100.7";
//const host = "localhost";

const express = require('express');
const body = require('body-parser');
const cors = require('cors');
const http = require('http');
const routes = require('./routes/routes');
const { setupRealtime } = require('./realtime');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.urlencoded({extended:true, limit:'1024mb'}));
app.use(express.json({limit:'2048mb'}));
app.use(express.static('public'));
app.use("/vmob",express.static('uploads'));
app.use("/tmb",express.static('thumbnails'));
app.use(routes);

server.listen(port,host,() => {
    console.log("Server running\nEndpoint: http://"+host+":"+port);
});

setupRealtime(server);