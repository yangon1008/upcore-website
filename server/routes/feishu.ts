import { Router } from 'express';

const FEISHU_APP_ID = process.env.FEISHU_APP_ID || '';
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || '';
const FEISHU_BASE_URL = 'https://open.feishu.cn/open-apis';

const router = Router();

// 飞书认证相关代理路由
router.post('/auth/app-access-token', async (req, res) => {
  try {
    const { app_id, app_secret } = req.body;
    const response = await fetch(`${FEISHU_BASE_URL}/auth/v3/app_access_token/internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: app_id || FEISHU_APP_ID, app_secret: app_secret || FEISHU_APP_SECRET })
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('获取 App Access Token 失败:', error.message);
    res.status(500).json({ code: -1, msg: '获取 App Access Token 失败' });
  }
});

router.post('/auth/user-access-token', async (req, res) => {
  try {
    const { grant_type, code } = req.body;
    const { authorization } = req.headers;
    
    const response = await fetch(`${FEISHU_BASE_URL}/authen/v1/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization as string
      },
      body: JSON.stringify({ grant_type, code })
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('获取 User Access Token 失败:', error.message);
    res.status(500).json({ code: -1, msg: '获取 User Access Token 失败' });
  }
});

router.get('/auth/user-info', async (req, res) => {
  try {
    const { authorization } = req.headers;
    
    const response = await fetch(`${FEISHU_BASE_URL}/authen/v1/user_info`, {
      headers: {
        'Authorization': authorization as string
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('获取用户信息失败:', error.message);
    res.status(500).json({ code: -1, msg: '获取用户信息失败' });
  }
});

// 日历相关代理路由
router.post('/calendar/freebusy', async (req, res) => {
  try {
    const { time_min, time_max, user_id, user_id_type } = req.body;
    const { authorization } = req.headers;
    
    const response = await fetch(`${FEISHU_BASE_URL}/calendar/v4/freebusy/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization as string
      },
      body: JSON.stringify({ time_min, time_max, user_id, user_id_type })
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('获取忙闲信息失败:', error.message);
    res.status(500).json({ code: -1, msg: '获取忙闲信息失败' });
  }
});

router.post('/calendar/events', async (req, res) => {
  try {
    const eventData = req.body;
    const { authorization } = req.headers;
    
    const response = await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars/primary/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization as string
      },
      body: JSON.stringify(eventData)
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('创建日程失败:', error.message);
    res.status(500).json({ code: -1, msg: '创建日程失败' });
  }
});

router.delete('/calendar/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { authorization } = req.headers;
    
    const response = await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authorization as string
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('取消日程失败:', error.message);
    res.status(500).json({ code: -1, msg: '取消日程失败' });
  }
});

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

// 创建日历
async function createFeishuCalendar(token: string, name: string, description: string = '', color: string = '#52c41a') {
  try {
    console.log('正在创建飞书日历...');
    console.log('参数:', { name, description, color });
    
    // 将十六进制颜色转换为整数
    let colorInt = 0x52c41a; // 默认颜色
    if (color.startsWith('#')) {
      colorInt = parseInt(color.replace('#', ''), 16);
    }
    
    const res = await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        description,
        color: colorInt,
        permissions: 'private'
      })
    });
    console.log('飞书API响应状态:', res.status);
    const data = await res.json();
    console.log('创建飞书日历响应:', JSON.stringify(data, null, 2));
    if (data.code !== 0) throw new Error(`创建飞书日历失败: ${data.msg}`);
    console.log('飞书日历:', JSON.stringify(data.data?.calendar, null, 2));
    return data.data?.calendar;
  } catch (error: any) {
    console.error('创建飞书日历异常:', error.message);
    console.error('创建飞书日历异常详细信息:', error);
    throw error;
  }
}

// 获取日历列表
async function getFeishuCalendars(token: string) {
  try {
    console.log('正在获取飞书日历列表...');
    const res = await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('飞书API响应状态:', res.status);
    const data = await res.json();
    console.log('获取飞书日历列表响应:', JSON.stringify(data, null, 2));
    if (data.code !== 0) throw new Error(`获取飞书日历列表失败: ${data.msg}`);
    return data.data?.calendar_list || [];
  } catch (error: any) {
    console.error('获取飞书日历列表异常:', error.message);
    console.error('获取飞书日历列表异常详细信息:', error);
    throw error;
  }
}

// 更新日历
async function updateFeishuCalendar(token: string, calendarId: string, updates: any) {
  try {
    console.log('正在更新飞书日历...');
    console.log('参数:', { calendarId, updates });
    const res = await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars/${calendarId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    console.log('飞书API响应状态:', res.status);
    const data = await res.json();
    console.log('更新飞书日历响应:', JSON.stringify(data, null, 2));
    if (data.code !== 0) throw new Error(`更新飞书日历失败: ${data.msg}`);
    return data.data?.calendar;
  } catch (error: any) {
    console.error('更新飞书日历异常:', error.message);
    console.error('更新飞书日历异常详细信息:', error);
    throw error;
  }
}

// 删除日历
async function deleteFeishuCalendar(token: string, calendarId: string) {
  try {
    console.log('正在删除飞书日历...');
    console.log('参数:', { calendarId });
    const res = await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars/${calendarId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('飞书API响应状态:', res.status);
    const data = await res.json();
    console.log('删除飞书日历响应:', JSON.stringify(data, null, 2));
    if (data.code !== 0) throw new Error(`删除飞书日历失败: ${data.msg}`);
    return true;
  } catch (error: any) {
    console.error('删除飞书日历异常:', error.message);
    console.error('删除飞书日历异常详细信息:', error);
    throw error;
  }
}

// 添加日程参与人
async function addEventAttendees(token: string, calendarId: string, eventId: string, attendees: any[]) {
  try {
    console.log('正在添加日程参与人...');
    console.log('参数:', { calendarId, eventId, attendees });
    const res = await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars/${calendarId}/events/${eventId}/attendees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ attendees })
    });
    console.log('飞书API响应状态:', res.status);
    const data = await res.json();
    console.log('添加日程参与人响应:', JSON.stringify(data, null, 2));
    if (data.code !== 0) throw new Error(`添加日程参与人失败: ${data.msg}`);
    return data.data?.attendees || [];
  } catch (error: any) {
    console.error('添加日程参与人异常:', error.message);
    console.error('添加日程参与人异常详细信息:', error);
    throw error;
  }
}

// 日历管理 API 端点
router.post('/calendars', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: '缺少日历名称' });
    }

    const token = await getAppAccessToken();
    const calendar = await createFeishuCalendar(token, name, description, color);

    res.status(201).json({
      success: true,
      data: calendar
    });
  } catch (error: any) {
    console.error('创建日历失败:', error.message);
    res.status(500).json({ success: false, error: '服务器内部错误，请稍后重试' });
  }
});

router.get('/calendars', async (req, res) => {
  try {
    const token = await getAppAccessToken();
    const calendars = await getFeishuCalendars(token);

    res.json({
      success: true,
      data: calendars
    });
  } catch (error: any) {
    console.error('获取日历列表失败:', error.message);
    res.status(500).json({ success: false, error: '服务器内部错误，请稍后重试' });
  }
});

router.put('/calendars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const token = await getAppAccessToken();
    const calendar = await updateFeishuCalendar(token, id, updates);

    res.json({
      success: true,
      data: calendar
    });
  } catch (error: any) {
    console.error('更新日历失败:', error.message);
    res.status(500).json({ success: false, error: '服务器内部错误，请稍后重试' });
  }
});

router.delete('/calendars/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const token = await getAppAccessToken();
    await deleteFeishuCalendar(token, id);

    res.json({
      success: true
    });
  } catch (error: any) {
    console.error('删除日历失败:', error.message);
    res.status(500).json({ success: false, error: '服务器内部错误，请稍后重试' });
  }
});

// 日程参与人管理 API 端点
router.post('/events/:eventId/attendees', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { calendarId, attendees } = req.body;

    if (!calendarId || !attendees || !Array.isArray(attendees)) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }

    const token = await getAppAccessToken();
    const addedAttendees = await addEventAttendees(token, calendarId, eventId, attendees);

    res.status(201).json({
      success: true,
      data: addedAttendees
    });
  } catch (error: any) {
    console.error('添加日程参与人失败:', error.message);
    res.status(500).json({ success: false, error: '服务器内部错误，请稍后重试' });
  }
});

export default router;