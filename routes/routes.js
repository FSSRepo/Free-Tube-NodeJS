import { Router } from 'express';
import { uploadVideo, processVideo, streamVideo, getVideoList } from '../controller/video.js';

const router = Router();

router.post("/upload",uploadVideo);
router.post("/process-upload", processVideo);
router.get("/stream-video/:id", streamVideo);
router.get("/video-list", getVideoList);

export default router;