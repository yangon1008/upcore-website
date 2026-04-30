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
              is_used as isUsed, used_by_name as usedByName, is_copied as isCopied
       FROM invitation_codes
       WHERE admin_user_id = ?
       AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [adminUserId]
    );

    res.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('获取邀请码列表失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.put('/:code/copied', async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ success: false, error: '缺少邀请码参数' });
    }

    const normalizedCode = code.toUpperCase().trim();
    
    await pool.execute(
      `UPDATE invitation_codes SET is_copied = 1 WHERE code = ?`,
      [normalizedCode]
    );

    res.json({ success: true, message: '邀请码标记为已复制' });
  } catch (error: any) {
    console.error('标记复制状态失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { code, userName } = req.body;
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
        `UPDATE invitation_codes SET used_at = NOW()
         WHERE code = ?`,
        [normalizedCode]
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
      `UPDATE invitation_codes SET used_by = ?, used_by_name = ?, used_at = NOW(), is_used = 1
       WHERE code = ?`,
      [userId, userName, normalizedCode]
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

// 更新邀请码的详细信息（职位、文件、介绍等）
router.put('/:code/info', async (req, res) => {
  try {
    const { code } = req.params;
    const { jobPositionId, jobPositionName, usedByFiles, usedByIntroduction, usedByGender, usedByAge, usedByPhone } = req.body;
    
    if (!code) {
      return res.status(400).json({ success: false, error: '缺少邀请码参数' });
    }

    const normalizedCode = code.toUpperCase().trim();
    
    // 将文件数组转换为JSON字符串
    const usedByFilesJson = usedByFiles && usedByFiles.length > 0 ? JSON.stringify(usedByFiles) : null;

    await pool.execute(
      `UPDATE invitation_codes 
       SET job_position_id = ?, job_position_name = ?, used_by_files = ?, used_by_introduction = ?, used_by_gender = ?, used_by_age = ?, used_by_phone = ?
       WHERE code = ?`,
      [jobPositionId || null, jobPositionName || null, usedByFilesJson, usedByIntroduction || null, usedByGender || null, usedByAge || null, usedByPhone || null, normalizedCode]
    );

    res.json({ success: true, message: '邀请码信息更新成功' });
  } catch (error: any) {
    console.error('更新邀请码信息失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 获取邀请码对应的用户信息
router.get('/:code/user-info', async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({ success: false, error: '缺少邀请码参数' });
    }

    const normalizedCode = code.toUpperCase().trim();

    const [rows] = await pool.execute(
      `SELECT used_by as userId, used_by_name as name, used_by_gender as gender, 
              used_by_age as age, used_by_phone as phone, job_position_id as jobPositionId,
              job_position_name as jobPositionName, used_by_files as files, 
              used_by_introduction as introduction
       FROM invitation_codes 
       WHERE code = ?`,
      [normalizedCode]
    ) as any[];

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: '邀请码不存在' });
    }

    const userInfo = rows[0];
    // 解析JSON文件数组
    if (userInfo.files) {
      try {
        userInfo.files = JSON.parse(userInfo.files);
      } catch (e) {
        userInfo.files = null;
      }
    }

    res.json({ success: true, userInfo });
  } catch (error: any) {
    console.error('获取邀请码用户信息失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 通过 userId 获取用户信息（从 invitation_codes 表）
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: '缺少用户ID参数' });
    }

    const [rows] = await pool.execute(
      `SELECT code, used_by as userId, used_by_name as name, used_by_gender as gender, 
              used_by_age as age, used_by_phone as phone, job_position_id as jobPositionId,
              job_position_name as jobPositionName, used_by_files as files, 
              used_by_introduction as introduction
       FROM invitation_codes 
       WHERE used_by = ?`,
      [userId]
    ) as any[];

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: '用户信息不存在' });
    }

    const userInfo = rows[0];
    // 解析JSON文件数组
    if (userInfo.files) {
      try {
        userInfo.files = JSON.parse(userInfo.files);
      } catch (e) {
        userInfo.files = null;
      }
    }

    res.json({ success: true, userInfo });
  } catch (error: any) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

export default router;
