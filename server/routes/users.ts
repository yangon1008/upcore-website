import express from 'express';
import { pool } from '../db/connection';
import { refreshUserToken, refreshExpiringTokens } from '../services/tokenRefreshService';

const router = express.Router();

// 获取用户信息
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM user_info WHERE user_id = ?',
      [userId]
    );
    if (Array.isArray(rows) && rows.length > 0) {
      res.json({ success: true, userInfo: rows[0] });
    } else {
      res.json({ success: false, message: '用户信息不存在' });
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取用户的飞书访问令牌
router.get('/:userId/feishu-token', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      'SELECT feishu_user_access_token, feishu_user_refresh_token, feishu_token_expires_at FROM user_info WHERE user_id = ?',
      [userId]
    );
    if (Array.isArray(rows) && rows.length > 0) {
      const tokenInfo = rows[0] as any;
      res.json({ 
        success: true, 
        tokenInfo: {
          accessToken: tokenInfo.feishu_user_access_token,
          refreshToken: tokenInfo.feishu_user_refresh_token,
          expiresAt: tokenInfo.feishu_token_expires_at
        }
      });
    } else {
      res.json({ success: false, message: '用户信息不存在' });
    }
  } catch (error) {
    console.error('获取飞书令牌失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 保存或更新用户信息
router.post('/save', async (req, res) => {
  try {
    const { userId, name, gender, age, phone, avatarUrl } = req.body;
    
    if (!userId || !name) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    // 检查用户是否已存在
    const [existing] = await pool.query(
      'SELECT * FROM user_info WHERE user_id = ?',
      [userId]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      // 更新现有用户
      await pool.query(
        'UPDATE user_info SET name = ?, gender = ?, age = ?, phone = ?, avatar_url = ? WHERE user_id = ?',
        [name, gender, age, phone, avatarUrl, userId]
      );
    } else {
      // 创建新用户
      await pool.query(
        'INSERT INTO user_info (user_id, name, gender, age, phone, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, name, gender, age, phone, avatarUrl]
      );
    }

    res.json({ success: true, message: '用户信息保存成功' });
  } catch (error) {
    console.error('保存用户信息失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 保存用户的飞书访问令牌
router.post('/save-feishu-token', async (req, res) => {
  try {
    const { userId, accessToken, refreshToken, expiresIn, name, avatarUrl, mobile } = req.body;
    
    if (!userId || !accessToken) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    // 计算过期时间（默认 2 小时，如果提供 expiresIn 则使用）
    const expiresAt = new Date();
    if (expiresIn) {
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    } else {
      expiresAt.setHours(expiresAt.getHours() + 2);
    }

    // 检查用户是否已存在
    const [existing] = await pool.query(
      'SELECT * FROM user_info WHERE user_id = ?',
      [userId]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      // 更新现有用户的令牌和信息
      await pool.query(
        'UPDATE user_info SET feishu_user_access_token = ?, feishu_user_refresh_token = ?, feishu_token_expires_at = ?, name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url), phone = COALESCE(?, phone) WHERE user_id = ?',
        [accessToken, refreshToken || null, expiresAt, name || null, avatarUrl || null, mobile || null, userId]
      );
    } else {
      // 创建新用户并保存令牌
      await pool.query(
        'INSERT INTO user_info (user_id, name, avatar_url, phone, feishu_user_access_token, feishu_user_refresh_token, feishu_token_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, name || '未知用户', avatarUrl || null, mobile || null, accessToken, refreshToken || null, expiresAt]
      );
    }

    res.json({ success: true, message: '飞书令牌保存成功' });
  } catch (error) {
    console.error('保存飞书令牌失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 手动刷新单个用户的令牌
router.post('/refresh-token', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: '缺少必要参数 userId' });
    }

    await refreshUserToken(userId);
    res.json({ success: true, message: '用户令牌刷新成功' });
  } catch (error: any) {
    console.error('手动刷新用户令牌失败:', error);
    res.status(500).json({ success: false, message: error.message || '服务器内部错误' });
  }
});

// 手动刷新所有即将过期的令牌
router.post('/refresh-all-tokens', async (_req, res) => {
  try {
    await refreshExpiringTokens();
    res.json({ success: true, message: '令牌刷新任务已执行' });
  } catch (error: any) {
    console.error('手动刷新所有令牌失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

export default router;