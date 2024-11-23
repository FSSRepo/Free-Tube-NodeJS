import fs from "fs";
import formidable from "formidable";
import { beginVideos, endVideos } from "../helper.js";
import { v4 as uuid } from "uuid";
import { exec } from "child_process";

const UploadVideoFile = (form, req) =>
  new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve(files.video);
    });
  });
const uploadVideo = async (req, res) => {
  if (fs.existsSync("./uploads") == false) {
    fs.mkdirSync("./uploads");
  }
  if (fs.existsSync("./thumbnails") == false) {
    fs.mkdirSync("./thumbnails");
  }
  let form = formidable({
    uploadDir: "./uploads",
    keepExtensions: true,
    maxFileSize: 1024 * 1024 * 1024, // max 1 GB
  });
  let video = await UploadVideoFile(form, req);
  let id = uuid();
  fs.renameSync("./uploads/" + video.newFilename, "./uploads/" + id + ".mp4");
  let videos = await beginVideos();
  videos.push({ id, name: "" });
  await endVideos(videos);
  res.status(200).send({ id });
};
const processVideo = async (req, res) => {
  const { name, id } = req.body;
  let videos = await beginVideos();
  videos.forEach((r) => {
    if (r.id === id) {
      r.name = name;
    }
  });
  await endVideos(videos);
  let time = (t) => { return t < 10 ? "0" + t : t; }
  exec("ffmpeg -i ./uploads/" + id + ".mp4", (er, so, se) => {
    let __dur = se.substring(se.indexOf("Duration: "));
    __dur = __dur.substring(9, __dur.indexOf("."));
    let dur_s = __dur.split(":");
    let duration = parseInt(dur_s[0]) * 3600 + parseInt(dur_s[1] * 60) + parseInt(dur_s[2]);
    let random_d = duration * Math.random();
    let hour = random_d / 3600, minute = (random_d / 60) % 60, second = random_d % 60;
    exec("ffmpeg -i ./uploads/" + id + ".mp4 -ss " +
      time(Math.floor(hour)) + ":" +
      time(Math.floor(minute)) +":" +
      time(Math.floor(second)) + " -vframes 1 ./thumbnails/" + id + ".png", (err, stdout, stderr) => {
      res.status(200).send({});
    });
  });
};
const getVideoList = async (req, res) => {
  res.status(200).send({ videos: await beginVideos() });
};
const streamVideo = (req, res) => {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
    return;
  }
  const path = "./uploads/" + req.params.id + ".mp4";
  const size = fs.statSync(path).size;
  const CHUNK_SIZE = 512 * 1024; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, size - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${size}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(path, { start, end });
  videoStream.pipe(res);
};

export { uploadVideo, getVideoList, processVideo, streamVideo };
