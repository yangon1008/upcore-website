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

    // 标准化时间格式的辅助函数
    const normalizeTime = (timeStr: any) => {
      if (!timeStr) return '';
      let timeStrVal = typeof timeStr === 'string' ? timeStr : String(timeStr);
      const parts = timeStrVal.split(':');
      const hour = String(parseInt(parts[0] || '0')).padStart(2, '0');
      const minute = String(parseInt(parts[1] || '0')).padStart(2, '0');
      return `${hour}:${minute}`;
    };

    const formattedRows = (rows as any[]).map(row => {
      let formattedSlotDate = null;
      if (row.slotDate) {
        if (row.slotDate instanceof Date) {
          // 使用本地时间而不是UTC时间
          const year = row.slotDate.getFullYear();
          const month = String(row.slotDate.getMonth() + 1).padStart(2, '0');
          const day = String(row.slotDate.getDate()).padStart(2, '0');
          formattedSlotDate = `${year}-${month}-${day}`;
        } else if (typeof row.slotDate === 'string') {
          formattedSlotDate = row.slotDate.split('T')[0];
        }
      }
      return {
        ...row,
        slotDate: formattedSlotDate,
        startTime: normalizeTime(row.startTime),
        endTime: normalizeTime(row.endTime)
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
    const { adminUserId, date } = req.query;
    if (!adminUserId) {
      return res.status(400).json({ success: false, error: '缺少 adminUserId 参数' });
    }

    // 如果传入了日期参数，使用该日期所在的周，否则使用今天
    const baseDate = date ? new Date(date as string) : new Date();
    const dayOfWeek = baseDate.getDay();
    const weekStart = new Date(baseDate);
    weekStart.setDate(baseDate.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const [slots] = await pool.execute(
      `SELECT * FROM admin_slots WHERE admin_user_id = ? AND is_active = 1`,
      [adminUserId]
    ) as any[];

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const [bookedSlots] = await pool.execute(
      `SELECT DATE_FORMAT(booking_date, '%Y-%m-%d') as booking_date, start_time, end_time, regular_user_name FROM bookings
       WHERE admin_user_id = ? AND status = 'confirmed'
         AND booking_date >= ? AND booking_date <= ?`,
      [adminUserId, weekStartStr, weekEndStr]
    ) as any[];

    // 标准化时间格式，去掉秒的部分
    const formatTime = (time: string) => {
      if (!time) return time;
      const parts = time.split(':');
      if (parts.length >= 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      }
      return time;
    };
    
    // 标准化日期格式为YYYY-MM-DD（使用本地时间）
    const formatDate = (date: any) => {
      if (!date) return date;
      if (typeof date === 'string') {
        return date.split('T')[0];
      }
      if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return date;
    };
    
    const bookedSet = new Set(bookedSlots.map((b: any) => `${formatDate(b.booking_date)}_${formatTime(b.start_time)}`));
    const bookedInfoMap = new Map(bookedSlots.map((b: any) => [`${formatDate(b.booking_date)}_${formatTime(b.start_time)}`, b.regular_user_name]));

    const available: any[] = [];
    const addedKeys = new Set<string>(); // 用于去重
    
    // 先处理特定时段（优先级更高）
    const specificSlots = slots.filter((s: any) => s.slot_type === 'specific');
    const regularSlots = slots.filter((s: any) => s.slot_type === 'regular');
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      // 使用本地时间而不是UTC时间
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayNum = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayNum}`;
      
      const day = date.getDay();

      // 先处理特定时段
      for (const slot of specificSlots) {
        if (slot.slot_date) {
          let slotDateStr = null;
          if (slot.slot_date instanceof Date) {
            // 使用本地时间而不是UTC时间
            const year = slot.slot_date.getFullYear();
            const month = String(slot.slot_date.getMonth() + 1).padStart(2, '0');
            const day = String(slot.slot_date.getDate()).padStart(2, '0');
            slotDateStr = `${year}-${month}-${day}`;
          } else if (typeof slot.slot_date === 'string') {
            slotDateStr = slot.slot_date.split('T')[0];
          }
          if (slotDateStr === dateStr) {
            const formattedStartTime = formatTime(slot.start_time);
            const key = `${dateStr}_${formattedStartTime}`;
            if (!addedKeys.has(key)) {
              addedKeys.add(key);
              const isBooked = bookedSet.has(key);
              available.push({
                id: slot.id,
                date: dateStr,
                dayOfWeek: day,
                startTime: formattedStartTime,
                endTime: formatTime(slot.end_time),
                displayDate: date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }),
                isBooked,
                bookedByName: isBooked ? bookedInfoMap.get(key) : null
              });
            }
          }
        }
      }

      // 再处理常驻时段（只添加特定时段未覆盖的）
      for (const slot of regularSlots) {
        if (slot.day_of_week === day) {
          const formattedStartTime = formatTime(slot.start_time);
          const key = `${dateStr}_${formattedStartTime}`;
          if (!addedKeys.has(key)) {
            addedKeys.add(key);
            const isBooked = bookedSet.has(key);
            available.push({
              id: slot.id,
              date: dateStr,
              dayOfWeek: day,
              startTime: formattedStartTime,
              endTime: formatTime(slot.end_time),
              displayDate: date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }),
              isBooked,
              bookedByName: isBooked ? bookedInfoMap.get(key) : null
            });
          }
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
