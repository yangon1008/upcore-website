import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 允许的文件类型
const allowedFileTypes = [
  // 图片
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  // PDF，Excel，CSV
  'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv',
  // Word
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // 视频
  'video/mp4', 'video/avi', 'video/mpeg', 'video/quicktime',
  // 其他常见文件
  'text/plain'
];

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB 限制
  },
  fileFilter: (req, file, cb) => {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

// 多文件上传路由
router.post('/upload', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    const files = req.files.map((file: Express.Multer.File) => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));

    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 单个文件上传路由
router.post('/upload/single', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    const file = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    };

    res.json({ success: true, file });
  } catch (error) {
    res.status(500).json({ error: '文件上传失败' });
  }
});

export default router;