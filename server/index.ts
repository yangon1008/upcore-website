import express from 'express';
import cors from 'cors';
import path from 'path';
import invitationCodesRoutes from './routes/invitationCodes';
import slotsRoutes from './routes/slots';
import bookingsRoutes from './routes/bookings';
import feishuRoutes from './routes/feishu';
import jobPositionsRoutes from './routes/jobPositions';
import filesRoutes from './routes/files';
import usersRoutes from './routes/users';
import { initializeDatabase } from './db/connection';
import { startTokenRefreshService } from './services/tokenRefreshService';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 添加全局请求日志中间件
app.use((req, res, next) => {
  console.log('========== 收到请求 ==========');
  console.log('方法:', req.method);
  console.log('URL:', req.url);
  console.log('请求体:', JSON.stringify(req.body, null, 2));
  console.log('==============================');
  
  // 保存原始的 json 方法
  const originalJson = res.json;
  const originalSend = res.send;
  
  // 重写 json 方法以捕获响应数据
  res.json = function(data: any) {
    console.log('========== 返回响应 ==========');
    console.log('URL:', req.url);
    console.log('响应数据:', JSON.stringify(data, null, 2));
    console.log('==============================');
    return originalJson.call(this, data);
  };
  
  next();
});

// 设置默认 Content-Type 为 UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use('/api/invitation-codes', invitationCodesRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/feishu', feishuRoutes);
app.use('/api/job-positions', jobPositionsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/users', usersRoutes);

// 配置静态文件服务，提供上传的文件
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 后端服务运行在 http://localhost:${PORT}`);
      console.log(`   API 端点:`);
      console.log(`   POST   /api/invitation-codes          — 生成邀请码`);
      console.log(`   GET    /api/invitation-codes          — 获取邀请码列表`);
      console.log(`   POST   /api/invitation-codes/verify   — 验证邀请码`);
      console.log(`   GET    /api/slots                     — 获取时段列表`);
      console.log(`   POST   /api/slots                     — 添加时段`);
      console.log(`   PUT    /api/slots/:id                 — 更新时段`);
      console.log(`   DELETE /api/slots/:id                 — 删除时段`);
      console.log(`   GET    /api/slots/available           — 获取可用时段`);
      console.log(`   POST   /api/bookings                  — 创建预约`);
      console.log(`   GET    /api/bookings                  — 获取预约列表`);
      console.log(`   DELETE /api/bookings/:id              — 取消预约`);
      console.log(`   GET    /api/job-positions             — 获取岗位列表`);
      console.log(`   POST   /api/job-positions             — 添加岗位`);
      console.log(`   PUT    /api/job-positions/:id         — 更新岗位`);
      console.log(`   DELETE /api/job-positions/:id         — 删除岗位`);
      console.log(`   POST   /api/feishu/calendars          — 创建日历`);
      console.log(`   GET    /api/feishu/calendars          — 获取日历列表`);
      console.log(`   PUT    /api/feishu/calendars/:id      — 更新日历`);
      console.log(`   DELETE /api/feishu/calendars/:id      — 删除日历`);
      console.log(`   POST   /api/feishu/events/:id/attendees — 添加日程参与人`);
      console.log(`   POST   /api/files/upload              — 多文件上传`);
      console.log(`   POST   /api/files/upload/single       — 单个文件上传`);
      console.log(`   POST   /api/users/refresh-token        — 手动刷新用户令牌`);
      console.log(`   POST   /api/users/refresh-all-tokens   — 手动刷新所有令牌`);
    });
    
    // 启动令牌刷新服务
    startTokenRefreshService();
  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
}

start();
