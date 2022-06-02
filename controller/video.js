import fs from "fs";
import formidable from "formidable";
import { beginVideos, endVideos } from "../helper.js";
import { v4 as uuid } from "uuid";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";
import ffmpeg from "fluent-ffmpeg";
import path from "path";

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

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
  ffmpeg.ffprobe(
    path.resolve("controller/", "../uploads/" + id + ".mp4"),
    (err, data) => {
      if (err) console.log(err);
      let random_d = data.format.duration * Math.random();
      let screenshot = "";
      ffmpeg(path.resolve("controller/", "../uploads/" + id + ".mp4"))
        .on("filenames", (file) => {
          screenshot = file[0];
        })
        .on("end", () => {
          fs.renameSync(
            "./thumbnails/" + screenshot,
            "./thumbnails/" + id + ".png"
          );
          res.status(200).send({});
        })
        .on("error", function (err) {
          console.log("an error happened: " + err.message);
        })
        .takeScreenshots(
          { count: 1, timemarks: [random_d.toString()], size: "640x360" },
          path.resolve("controller/", "../thumbnails")
        );
    }
  );
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
