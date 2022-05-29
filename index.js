// Setting Server Listener
const port = 3000;
const host = "192.168.100.7";
//const host = "localhost";

const express = require('express');
const body = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const formidable = require('formidable');
const http = require('http');
const {Server} = require('socket.io');
const uuid = require('uuid').v4;

const app = express();
const server = http.createServer(app);
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

app.use(cors());
app.use(body.urlencoded({extended:true, limit:'1024mb'}));
app.use(body.json({limit:'2048mb'}));
app.use(express.static('public'));
app.use("/vmob",express.static('uploads'));

function writeDatabase(videos,callback) {
    fs.writeFile('./database.json', JSON.stringify({videos}), err => {
      if (err) console.log("Error writing file:", err);
      callback();
    });
}

function readDatabase(callback) {
    if(fs.existsSync('./database.json') === false){
        callback([]);
        return;
    }
    fs.readFile('./database.json', "utf8", (err, json) => {
      if (err) {
        console.log("Activities Database:", err);
        return;
      }
      if(json.length > 0) {
          callback(JSON.parse(json).videos);
      }else{
          callback([]);
      }
    });
}

app.post("/upload",(req,res) => {
	if(fs.existsSync('./uploads') == false){
		fs.mkdirSync('./uploads');
	}
    let fr = formidable({
        uploadDir: './uploads',
        keepExtensions: true,
        maxFileSize: 1024 * 1024 * 1024
    });
    fr.parse(req, function(err, fields, files) {
        let id = uuid();
        fs.rename('./uploads/'+files.video.newFilename, './uploads/'+id+".mp4", function(err) {
        if (err)
            throw err;
        });
        readDatabase((videos) => {
            videos.push({id,name: ""});
            writeDatabase(videos,() => {
                res.status(200).send({id});
            });
        });
    });
});

app.post("/process-upload",(req,res) => {
    readDatabase((videos) => {
        videos.find(r => {
            if(r.id === req.body.id) {
                r.name = req.body.name;
            }
            return false;
        });
        writeDatabase(videos,() => {
            res.status(200).send({});
        });
    });
});

app.get("/video-list",(req,res) => {
    readDatabase((videos) => {
        res.status(200).send({videos});
    })
});

app.get("/video/:id",(req,res) => {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
        return;
    }
    const path = './uploads/'+req.params.id+'.mp4';
    const size = fs.statSync(path).size;
    const CHUNK_SIZE = 512 * 1024; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, size - 1);
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4"
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(path, { start, end });
    videoStream.pipe(res);
});

server.listen(port,host,() => {
    console.log("Server running\nEndpoint: http://"+host+":"+port);
});