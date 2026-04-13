import { Router } from 'express';
import { pool } from '../db/connection';

const router = Router();

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

router.post('/', async (req, res) => {
  try {
    const { adminUserId, adminUserName, expireDays = 7 } = req.body;
    if (!adminUserId || !adminUserName) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000);

    const [result] = await pool.execute(
      `INSERT INTO invitation_codes (code, admin_user_id, admin_user_name, expires_at)
       VALUES (?, ?, ?, ?)`,
      [code, adminUserId, adminUserName, expiresAt]
    );

    const insertResult = result as any;
    res.status(201).json({
      success: true,
      data: {
        id: insertResult.insertId,
        code,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      }
    });
  } catch (error: any) {
    console.error('生成邀请码失败:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, error: '邀请码重复，请重试' });
    }
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { adminUserId } = req.query;
    if (!adminUserId) {
      return res.status(400).json({ success: false, error: '缺少 adminUserId 参数' });
    }

    const [rows] = await pool.execute(
      `SELECT id, code, created_at as createdAt, expires_at as expiresAt,
              is_used as isUsed, used_by_name as usedByName
       FROM invitation_codes
       WHERE admin_user_id = ?
       ORDER BY created_at DESC`,
      [adminUserId]
    );

    res.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('获取邀请码列表失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { code, userName, gender = '', age = '', phone = '' } = req.body;
    if (!code || !userName) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }

    const normalizedCode = code.toUpperCase().trim();

    const [rows] = await pool.execute(
      `SELECT * FROM invitation_codes WHERE code = ?`,
      [normalizedCode]
    ) as any[];

    if (rows.length === 0) {
      return res.status(400).json({ success: false, error: '邀请码无效或已过期' });
    }

    const inviteCode = rows[0];

    if (new Date(inviteCode.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: '邀请码已过期' });
    }

    // 检查邀请码是否已经被使用
    if (inviteCode.is_used) {
      // 如果邀请码已被使用，检查当前用户是否是第一次使用该邀请码的用户
      if (inviteCode.used_by_name !== userName) {
        return res.status(400).json({ success: false, error: '邀请码已被使用' });
      }
      // 如果是第一次使用该邀请码的用户，允许登录
      const userId = inviteCode.used_by;
      // 更新邀请码记录（用最新的使用信息）
      await pool.execute(
        `UPDATE invitation_codes SET used_by_gender = ?, used_by_age = ?, used_by_phone = ?
         WHERE code = ?`,
        [gender, age, phone, normalizedCode]
      );
      res.json({
        success: true,
        data: {
          valid: true,
          codeInfo: {
            code: inviteCode.code,
            adminUserId: inviteCode.admin_user_id,
            adminUserName: inviteCode.admin_user_name,
            expiresAt: new Date(inviteCode.expires_at).toISOString()
          },
          userId
        }
      });
      return;
    }

    // 生成新的 userId
    const userId = `regular_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 更新邀请码记录
    await pool.execute(
      `UPDATE invitation_codes SET used_by = ?, used_by_name = ?, used_by_gender = ?, used_by_age = ?, used_by_phone = ?, used_at = NOW(), is_used = 1
       WHERE code = ?`,
      [userId, userName, gender, age, phone, normalizedCode]
    );

    res.json({
      success: true,
      data: {
        valid: true,
        codeInfo: {
          code: inviteCode.code,
          adminUserId: inviteCode.admin_user_id,
          adminUserName: inviteCode.admin_user_name,
          expiresAt: new Date(inviteCode.expires_at).toISOString()
        },
        userId
      }
    });
  } catch (error: any) {
    console.error('验证邀请码失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

export default router;
