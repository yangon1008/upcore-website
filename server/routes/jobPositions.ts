import { Router } from 'express';
import { pool } from '../db/connection';

const router = Router();

// 获取面试官的岗位列表
router.get('/', async (req, res) => {
  try {
    const { adminUserId } = req.query;
    if (!adminUserId) {
      return res.status(400).json({ success: false, error: '缺少 adminUserId 参数' });
    }

    const [rows] = await pool.execute(
      `SELECT id, position_name as positionName, description, is_active as isActive, created_at as createdAt
       FROM job_positions
       WHERE admin_user_id = ?
       ORDER BY created_at DESC`,
      [adminUserId]
    );

    res.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('获取岗位列表失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 添加新岗位
router.post('/', async (req, res) => {
  try {
    const { adminUserId, positionName, description } = req.body;
    if (!adminUserId || !positionName) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }

    const [result] = await pool.execute(
      `INSERT INTO job_positions (admin_user_id, position_name, description)
       VALUES (?, ?, ?)`,
      [adminUserId, positionName, description || '']
    );

    const insertResult = result as any;
    res.status(201).json({
      success: true,
      data: {
        id: insertResult.insertId,
        positionName,
        description: description || '',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('添加岗位失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 更新岗位
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { positionName, description, isActive } = req.body;

    if (!positionName) {
      return res.status(400).json({ success: false, error: '缺少岗位名称' });
    }

    await pool.execute(
      `UPDATE job_positions SET position_name = ?, description = ?, is_active = ?
       WHERE id = ?`,
      [positionName, description || '', isActive, id]
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error('更新岗位失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 删除岗位
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(`DELETE FROM job_positions WHERE id = ?`, [id]);

    res.json({ success: true });
  } catch (error: any) {
    console.error('删除岗位失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

export default router;