const express = require('express');
const { uploadVideo, processVideo, streamVideo, getVideoList } = require('../controller/video');
const router = express.Router();

router.post("/upload",uploadVideo);
router.post("/process-upload", processVideo);
router.get("/stream-video/:id", streamVideo);
router.get("/video-list", getVideoList);

module.exports = router;