import { Router } from 'express';
import { pool } from '../db/connection';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { adminUserId } = req.query;
    if (!adminUserId) {
      return res.status(400).json({ success: false, error: '缺少 adminUserId 参数' });
    }

    const [rows] = await pool.execute(
      `SELECT id, slot_type as slotType, day_of_week as dayOfWeek, slot_date as slotDate,
              start_time as startTime, end_time as endTime, is_active as isActive
       FROM admin_slots
       WHERE admin_user_id = ? AND is_active = 1
       ORDER BY created_at DESC`,
      [adminUserId]
    );

    const formattedRows = (rows as any[]).map(row => {
      let formattedSlotDate = null;
      if (row.slotDate) {
        if (row.slotDate instanceof Date) {
          formattedSlotDate = row.slotDate.toISOString().split('T')[0];
        } else if (typeof row.slotDate === 'string') {
          formattedSlotDate = row.slotDate.split('T')[0];
        }
      }
      return {
        ...row,
        slotDate: formattedSlotDate
      };
    });

    res.json({ success: true, data: formattedRows });
  } catch (error: any) {
    console.error('获取时段列表失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { adminUserId, slotType, dayOfWeek, slotDate, startTime, endTime } = req.body;
    if (!adminUserId || !slotType || !startTime || !endTime) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }

    const [result] = await pool.execute(
      `INSERT INTO admin_slots (admin_user_id, slot_type, day_of_week, slot_date, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminUserId, slotType, dayOfWeek || null, slotDate || null, startTime, endTime]
    );

    const insertResult = result as any;
    res.status(201).json({ success: true, data: { id: insertResult.insertId } });
  } catch (error: any) {
    console.error('创建时段失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { slotType, dayOfWeek, slotDate, startTime, endTime, isActive } = req.body;

    const [result] = await pool.execute(
      `UPDATE admin_slots SET slot_type=?, day_of_week=?, slot_date=?, start_time=?, end_time=?, is_active=?
       WHERE id=?`,
      [
        slotType,
        dayOfWeek !== undefined ? dayOfWeek : null,
        slotDate !== undefined ? slotDate : null,
        startTime,
        endTime,
        isActive !== undefined ? isActive : 1,
        id
      ]
    );

    const updateResult = result as any;
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ success: false, error: '时段不存在' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('更新时段失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(`DELETE FROM admin_slots WHERE id=?`, [id]);
    res.json({ success: true });
  } catch (error: any) {
    console.error('删除时段失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

router.get('/available', async (req, res) => {
  try {
    const { adminUserId } = req.query;
    if (!adminUserId) {
      return res.status(400).json({ success: false, error: '缺少 adminUserId 参数' });
    }

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 7);

    const [slots] = await pool.execute(
      `SELECT * FROM admin_slots WHERE admin_user_id = ? AND is_active = 1`,
      [adminUserId]
    ) as any[];

    const [bookedSlots] = await pool.execute(
      `SELECT booking_date, start_time, end_time FROM bookings
       WHERE admin_user_id = ? AND status = 'confirmed'
         AND booking_date >= CURDATE() AND booking_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)`,
      [adminUserId]
    ) as any[];

    const bookedSet = new Set(bookedSlots.map((b: any) => `${b.booking_date}_${b.start_time}`));

    const available: any[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(now.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const day = date.getDay();

      for (const slot of slots) {
        let match = false;
        if (slot.slot_type === 'regular' && slot.day_of_week === day) match = true;
        if (slot.slot_type === 'specific' && slot.slot_date) {
          let slotDateStr = null;
          if (slot.slot_date instanceof Date) {
            slotDateStr = slot.slot_date.toISOString().split('T')[0];
          } else if (typeof slot.slot_date === 'string') {
            slotDateStr = slot.slot_date.split('T')[0];
          }
          if (slotDateStr === dateStr) match = true;
        }

        if (match && !bookedSet.has(`${dateStr}_${slot.start_time}`)) {
          available.push({
            id: slot.id,
            date: dateStr,
            dayOfWeek: day,
            startTime: slot.start_time,
            endTime: slot.end_time,
            displayDate: date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })
          });
        }
      }
    }

    res.json({ success: true, data: available });
  } catch (error: any) {
    console.error('获取可用时段失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

export default router;
