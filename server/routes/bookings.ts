import { Router } from 'express';
import { pool } from '../db/connection';

const FEISHU_APP_ID = process.env.FEISHU_APP_ID || '';
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || '';
const FEISHU_BASE_URL = 'https://open.feishu.cn/open-apis';

const router = Router();

async function getAppAccessToken() {
  try {
    console.log('正在获取 App Access Token...');
    console.log('App ID:', FEISHU_APP_ID);
    console.log('App Secret:', FEISHU_APP_SECRET.substring(0, 20) + '...');
    const res = await fetch(`${FEISHU_BASE_URL}/auth/v3/app_access_token/internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET })
    });
    console.log('飞书API响应状态:', res.status);
    console.log('飞书API响应头:', res.headers);
    const data = await res.json();
    console.log('获取 App Access Token 响应:', JSON.stringify(data, null, 2));
    if (data.code === 0) return data.app_access_token;
    throw new Error(`获取 App Access Token 失败: ${data.msg}`);
  } catch (error: any) {
    console.error('获取 App Access Token 异常:', error.message);
    console.error('获取 App Access Token 异常详细信息:', error);
    throw error;
  }
}

// 模拟获取user_access_token（实际项目中需要通过OAuth授权流程获取）
async function getMockUserAccessToken() {
  try {
    console.log('正在获取 Mock User Access Token...');
    // 注意：这只是一个临时解决方案
    // 实际项目中需要通过OAuth授权流程获取真实的user_access_token
    // 这里我们使用app_access_token作为临时替代
    // 但需要注意，这种方式可能无法操作用户的个人日历
    const appToken = await getAppAccessToken();
    console.log('使用App Access Token作为临时替代');
    return appToken;
  } catch (error: any) {
    console.error('获取 Mock User Access Token 异常:', error.message);
    throw error;
  }
}

async function getOrCreateInterviewCalendar(token: string) {
  try {
    console.log('正在获取或创建面试日历...');
    // 首先获取日历列表
    const res = await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('获取日历列表响应状态:', res.status);
    const data = await res.json();
    console.log('获取日历列表响应:', JSON.stringify(data, null, 2));
    if (data.code !== 0) {
      console.error('获取日历列表失败:', data.msg);
      // 直接使用默认日历
      return 'primary';
    }
    
    const calendars = data.data?.calendar_list || [];
    console.log('获取到的日历列表:', JSON.stringify(calendars, null, 2));
    // 查找是否已有"面试"日历
    const interviewCalendar = calendars.find((cal: any) => cal.summary === '面试');
    
    if (interviewCalendar) {
      console.log('找到已有面试日历:', interviewCalendar.calendar_id);
      return interviewCalendar.calendar_id;
    }
    
    // 如果没有，创建新的面试日历
    console.log('创建新的面试日历...');
    const createRes = await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        summary: '面试',
        description: '面试预约日程',
        color: parseInt('1890ff', 16), // 天蓝色
        permissions: 'private'
      })
    });
    console.log('创建日历响应状态:', createRes.status);
    const createData = await createRes.json();
    console.log('创建日历响应:', JSON.stringify(createData, null, 2));
    if (createData.code !== 0) {
      console.error('创建面试日历失败:', createData.msg);
      // 直接使用默认日历
      return 'primary';
    }
    
    const calendarId = createData.data?.calendar?.calendar_id;
    console.log('创建面试日历成功:', calendarId);
    return calendarId || 'primary';
  } catch (error: any) {
    console.error('获取或创建面试日历异常:', error.message);
    console.error('获取或创建面试日历异常详细信息:', error);
    // 如果失败，回退到使用默认日历
    return 'primary';
  }
}

async function createFeishuEvent(token: string, summary: string, startTime: string, endTime: string, userId: string, calendarId?: string, color?: string) {
  try {
    console.log('正在创建飞书日程...');
    // 获取或创建面试日历
    const finalCalendarId = calendarId || await getOrCreateInterviewCalendar(token);
    console.log('使用的日历ID:', finalCalendarId);
    
    console.log('参数:', {
      summary,
      startTime,
      endTime,
      userId,
      calendarId: finalCalendarId,
      color
    });
    // 天蓝色的十六进制颜色代码转换为整数，默认天蓝色
    const colorInt = color ? parseInt(color.replace('#', ''), 16) : parseInt('1890ff', 16);
    
    // 构建请求体
    const requestBody = {
      summary,
      description: `面试预约：${summary}`,
      start_time: { timestamp: Math.floor(new Date(startTime).getTime() / 1000) },
      end_time: { timestamp: Math.floor(new Date(endTime).getTime() / 1000) },
      vchat: {
        vc_type: 'vc',
        need_meeting_room: false
      },
      visibility: 'default',
      need_notification: true,
      color: colorInt
    };
    
    // 尝试使用open_id类型
    try {
      console.log('尝试使用open_id类型创建日程...');
      const res = await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars/${finalCalendarId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...requestBody,
          organizer: {
            user_id_type: 'open_id',
            id: userId
          }
        })
      });
      
      console.log('飞书API响应状态:', res.status);
      const data = await res.json();
      console.log('创建飞书日程响应:', JSON.stringify(data, null, 2));
      
      if (data.code === 0) {
        console.log('飞书日程事件:', JSON.stringify(data.data?.event, null, 2));
        return data.data?.event;
      }
      
      // 如果open_id失败，尝试使用user_id类型
      console.log('open_id类型失败，尝试使用user_id类型...');
    } catch (openIdError) {
      console.error('使用open_id创建日程失败:', openIdError.message);
    }
    
    // 使用user_id类型
    const res = await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars/${finalCalendarId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...requestBody,
        organizer: {
          user_id_type: 'user_id',
          id: userId
        }
      })
    });
    console.log('飞书API响应状态:', res.status);
    console.log('飞书API响应头:', res.headers);
    const data = await res.json();
    console.log('创建飞书日程响应:', JSON.stringify(data, null, 2));
    if (data.code !== 0) throw new Error(`创建飞书日程失败: ${data.msg}`);
    console.log('飞书日程事件:', JSON.stringify(data.data?.event, null, 2));
    return data.data?.event;
  } catch (error: any) {
    console.error('创建飞书日程异常:', error.message);
    console.error('创建飞书日程异常详细信息:', error);
    throw error;
  }
}

router.post('/', async (req, res) => {
  console.log('收到预约请求:', req.body);
  try {
    const { adminUserId, adminUserName, regularUserId, regularUserName, invitationCode, jobPositionId, jobPositionName, bookingDate, startTime, endTime } = req.body;
    console.log('请求参数:', { adminUserId, adminUserName, regularUserId, regularUserName, invitationCode, jobPositionId, jobPositionName, bookingDate, startTime, endTime });
    
    if (!adminUserId || !regularUserName || !bookingDate || !startTime || !endTime) {
      console.log('缺少必要参数:', { adminUserId, regularUserName, bookingDate, startTime, endTime });
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }

    console.log('检查是否已经存在预约...');
    const [existingBookings] = await pool.execute(
      `SELECT id FROM bookings 
       WHERE admin_user_id = ? 
         AND booking_date = ? 
         AND start_time = ? 
         AND status = 'confirmed'`,
      [adminUserId, bookingDate, startTime]
    );
    console.log('已存在预约:', existingBookings);

    if ((existingBookings as any[]).length > 0) {
      console.log('该时间段已被预约:', { adminUserId, bookingDate, startTime });
      return res.status(400).json({ success: false, error: '该时间段已被预约' });
    }

    console.log('开始插入预约记录...');
    const [result] = await pool.execute(
      `INSERT INTO bookings (admin_user_id, admin_user_name, regular_user_id, regular_user_name,
                              invitation_code, job_position_id, job_position_name, booking_date, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminUserId, adminUserName || '', regularUserId, regularUserName, invitationCode || '', jobPositionId || null, jobPositionName || null, bookingDate, startTime, endTime]
    );

    const insertResult = result as any;
    const bookingId = insertResult.insertId;
    console.log('预约记录插入成功:', { bookingId });

    let feishuEventId = null;
    let feishuMeetingUrl = null;

    console.log('开始处理飞书API调用...');
    try {
      console.log('飞书API调用开始');
      console.log('开始获取 User Access Token...');
      const token = await getMockUserAccessToken();
      console.log('获取 User Access Token 成功:', token.substring(0, 20) + '...');
      
      console.log('开始创建飞书日程...');
      const event = await createFeishuEvent(
        token,
        `面试-${regularUserName}-${jobPositionName || '未知岗位'}`,
        `${bookingDate}T${startTime}+08:00`,
        `${bookingDate}T${endTime}+08:00`,
        adminUserId,
        req.body.calendarId,
        req.body.color
      );

      console.log('飞书API响应:', JSON.stringify(event, null, 2));
      feishuEventId = event?.event_id || event?.id || null;
      // 尝试从不同字段提取会议链接
      feishuMeetingUrl = event?.meeting_url || event?.vc_url || event?.join_url || event?.vchat?.meeting_url || event?.vchat?.vc_url || null;
      console.log('飞书会议信息:', { feishuEventId, feishuMeetingUrl });

      console.log('开始更新预约记录...');
      const [updateResult] = await pool.execute(
        `UPDATE bookings SET feishu_event_id=?, feishu_meeting_url=? WHERE id=?`,
        [feishuEventId, feishuMeetingUrl, bookingId]
      );
      console.log('预约记录更新成功:', { bookingId, feishuEventId, feishuMeetingUrl, updateResult });
      console.log('飞书API调用成功');
    } catch (feishuErr: any) {
      console.error('飞书日程创建失败(预约已记录):', feishuErr.message);
      console.error('飞书日程创建失败详细信息:', feishuErr);
      console.error('飞书API调用失败');
    } finally {
      console.log('飞书API调用处理完成:', { feishuEventId, feishuMeetingUrl });
    }

    console.log('返回响应:', {
      success: true,
      data: {
        id: bookingId,
        bookingDate,
        startTime,
        endTime,
        feishuEventId,
        feishuMeetingUrl
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: bookingId,
        bookingDate,
        startTime,
        endTime,
        feishuEventId,
        feishuMeetingUrl
      }
    });
  } catch (error: any) {
    console.error('创建预约失败:', error.message);
    console.error('创建预约失败详细信息:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: '该时间段已被预约' });
    }
    res.status(500).json({ success: false, error: '服务器内部错误，请稍后重试' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { adminUserId, regularUserId } = req.query;
    if (!adminUserId && !regularUserId) {
      return res.status(400).json({ success: false, error: '缺少 adminUserId 或 regularUserId 参数' });
    }

    let query: string;
    let params: any[];

    if (adminUserId) {
      query = `
        SELECT b.id, b.regular_user_name as regularUserName, b.booking_date as bookingDate,
                b.start_time as startTime, b.end_time as endTime,
                b.feishu_meeting_url as feishuMeetingUrl, b.status, b.created_at as createdAt,
                i.used_by_gender as gender, i.used_by_age as age, i.used_by_phone as phone,
                i.used_by_resume as resume, i.used_by_video as video,
                i.used_by_website as website, i.used_by_introduction as introduction,
                b.job_position_name as jobPositionName
         FROM bookings b
         LEFT JOIN invitation_codes i ON b.invitation_code = i.code
         WHERE b.admin_user_id = ? AND b.status = 'confirmed'
         ORDER BY b.booking_date ASC, b.start_time ASC
      `;
      params = [adminUserId];
    } else {
      query = `
        SELECT b.id, b.admin_user_name as adminUserName, b.booking_date as bookingDate,
                b.start_time as startTime, b.end_time as endTime,
                b.feishu_meeting_url as feishuMeetingUrl, b.status, b.created_at as createdAt
         FROM bookings b
         WHERE b.regular_user_id = ? AND b.status = 'confirmed'
         ORDER BY b.booking_date DESC, b.start_time DESC
         LIMIT 1
      `;
      params = [regularUserId];
    }

    const [rows] = await pool.execute(query, params);

    res.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('获取预约列表失败:', error.message);
    console.error('获取预约列表失败详细信息:', error);
    res.status(500).json({ success: false, error: '服务器内部错误，请稍后重试' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT feishu_event_id FROM bookings WHERE id=? AND status='confirmed'`,
      [id]
    ) as any[];

    if (rows.length > 0 && rows[0].feishu_event_id) {
      try {
        const token = await getAppAccessToken();
        await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars/primary/events/${rows[0].feishu_event_id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (_err) {}
    }

    await pool.execute(`UPDATE bookings SET status='cancelled' WHERE id=?`, [id]);
    res.json({ success: true });
  } catch (error: any) {
    console.error('取消预约失败:', error.message);
    console.error('取消预约失败详细信息:', error);
    res.status(500).json({ success: false, error: '服务器内部错误，请稍后重试' });
  }
});

export default router;
