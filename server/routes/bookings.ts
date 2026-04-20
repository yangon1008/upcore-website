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
async function refreshFeishuUserAccessToken(refreshToken: string) {
  try {
    console.log('正在使用 Refresh Token 刷新 User Access Token...');
    const appToken = await getAppAccessToken();
    
    const res = await fetch(`${FEISHU_BASE_URL}/authen/v1/refresh_access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appToken}`
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });
    
    console.log('刷新 Token 响应状态:', res.status);
    const data = await res.json();
    console.log('刷新 Token 响应:', JSON.stringify(data, null, 2));
    
    if (data.code !== 0) {
      throw new Error(`刷新 Token 失败: ${data.msg}`);
    }
    
    return {
      access_token: data.data.access_token,
      refresh_token: data.data.refresh_token,
      expires_in: data.data.expires_in
    };
  } catch (error: any) {
    console.error('刷新 User Access Token 异常:', error.message);
    console.error('刷新 User Access Token 异常详细信息:', error);
    throw error;
  }
}

async function saveFeishuTokensToDB(
  userId: string,
  accessToken: string,
  refreshToken?: string,
  expiresIn?: number
) {
  try {
    console.log('正在保存飞书 Token 到数据库...');
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString().replace('T', ' ').substring(0, 19);
    }
    
    await pool.execute(
      `UPDATE user_info 
       SET feishu_user_access_token = ?, 
           feishu_user_refresh_token = ?, 
           feishu_token_expires_at = ? 
       WHERE user_id = ?`,
      [accessToken, refreshToken || null, expiresAt, userId]
    );
    
    console.log('飞书 Token 保存成功');
  } catch (error: any) {
    console.error('保存飞书 Token 到数据库异常:', error.message);
    throw error;
  }
}

async function getUserAccessTokenFromDB(adminUserId: string) {
  try {
    console.log('正在从数据库获取 User Access Token...', adminUserId);
    const [rows] = await pool.execute(
      'SELECT feishu_user_access_token, feishu_user_refresh_token, feishu_token_expires_at FROM user_info WHERE user_id = ?',
      [adminUserId]
    );
    
    if (Array.isArray(rows) && rows.length > 0) {
      const tokenInfo = rows[0] as any;
      const accessToken = tokenInfo.feishu_user_access_token;
      const refreshToken = tokenInfo.feishu_user_refresh_token;
      const expiresAt = tokenInfo.feishu_token_expires_at;
      
      if (accessToken) {
        // 检查 token 是否过期
        let tokenExpired = false;
        if (expiresAt) {
          const now = new Date();
          const expireDate = new Date(expiresAt);
          if (now >= expireDate) {
            console.log('User Access Token 已过期');
            tokenExpired = true;
          }
        }
        
        if (!tokenExpired) {
          console.log('成功从数据库获取有效的 User Access Token');
          return accessToken;
        }
        
        // Token 已过期，尝试刷新
        if (refreshToken) {
          console.log('尝试使用 Refresh Token 刷新...');
          try {
            const newTokens = await refreshFeishuUserAccessToken(refreshToken);
            // 保存新的 token 到数据库
            await saveFeishuTokensToDB(
              adminUserId,
              newTokens.access_token,
              newTokens.refresh_token,
              newTokens.expires_in
            );
            console.log('Token 刷新成功，返回新的 Access Token');
            return newTokens.access_token;
          } catch (refreshErr: any) {
            console.error('刷新 Token 失败:', refreshErr.message);
            console.log('无法刷新 Token，返回 null');
            return null;
          }
        } else {
          console.log('没有 Refresh Token，无法刷新');
          return null;
        }
      }
    }
    
    console.log('数据库中没有找到有效的 User Access Token');
    return null;
  } catch (error: any) {
    console.error('从数据库获取 User Access Token 异常:', error.message);
    return null;
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

async function createFeishuEvent(token: string, summary: string, startTime: string, endTime: string, userId: string, calendarId?: string, color?: string, userIntroduction?: string) {
  let currentToken = token;
  let retryCount = 0;
  const maxRetries = 1;

  while (retryCount <= maxRetries) {
    try {
      console.log('正在创建飞书日程...');
      console.log('使用的 token:', currentToken.substring(0, 20) + '...');
      console.log('重试次数:', retryCount);
      
      // 获取或创建面试日历
      const finalCalendarId = calendarId || await getOrCreateInterviewCalendar(currentToken);
      console.log('使用的日历ID:', finalCalendarId);
      
      console.log('参数:', {
        summary,
        startTime,
        endTime,
        userId,
        calendarId: finalCalendarId,
        color,
        userIntroduction
      });
      
      // 天蓝色的十六进制颜色代码转换为整数，默认天蓝色
      const colorInt = color ? parseInt(color.replace('#', ''), 16) : parseInt('1890ff', 16);
      
      // 构建请求体 - 根据飞书 API 文档要求
      const requestBody = {
        summary: summary,
        description: userIntroduction || `面试预约：${summary}`,
        start_time: {
          timestamp: Math.floor(new Date(startTime).getTime() / 1000),
          time_zone: 'Asia/Shanghai'
        },
        end_time: {
          timestamp: Math.floor(new Date(endTime).getTime() / 1000),
          time_zone: 'Asia/Shanghai'
        },
        vchat: {
          vc_type: 'vc'
        },
        visibility: 'default',
        need_notification: true,
        color: colorInt
      };
      
      console.log('请求体:', JSON.stringify(requestBody, null, 2));
      
      // 创建日程
      const res = await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars/${finalCalendarId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('飞书API响应状态:', res.status);
      const data = await res.json();
      console.log('创建飞书日程响应:', JSON.stringify(data, null, 2));
      
      // 检查是否是令牌过期错误
      if (data.code === 99991677) {
        console.warn('检测到令牌过期错误');
        if (retryCount < maxRetries) {
          console.log('尝试刷新令牌并重试...');
          // 如果是第一次失败，尝试刷新令牌
          const newToken = await getUserAccessTokenFromDB(userId);
          if (newToken && newToken !== currentToken) {
            currentToken = newToken;
            retryCount++;
            console.log('令牌刷新成功，继续重试...');
            continue;
          } else {
            console.warn('无法刷新令牌，抛出错误');
            throw new Error(`创建飞书日程失败: ${data.msg} (code: ${data.code})`);
          }
        } else {
          console.warn('已达到最大重试次数');
          throw new Error(`创建飞书日程失败: ${data.msg} (code: ${data.code})`);
        }
      }
      
      if (data.code !== 0) {
        throw new Error(`创建飞书日程失败: ${data.msg} (code: ${data.code})`);
      }
      
      console.log('飞书日程事件:', JSON.stringify(data.data?.event, null, 2));
      return { event: data.data?.event, calendarId: finalCalendarId };
    } catch (error: any) {
      // 如果是在重试过程中抛出的错误，直接抛出
      if (retryCount > 0) {
        console.error('重试后仍然失败:', error.message);
        throw error;
      }
      
      console.error('创建飞书日程异常:', error.message);
      console.error('创建飞书日程异常详细信息:', error);
      throw error;
    }
  }
  
  // 应该不会到这里
  throw new Error('创建飞书日程失败: 未知错误');
}

router.post('/', async (req, res) => {
  console.log('========== 收到预约请求 ==========');
  console.log('请求体:', JSON.stringify(req.body, null, 2));
  try {
    const { adminUserId, adminUserName, regularUserId, regularUserName, invitationCode, jobPositionId, jobPositionName, bookingDate, startTime, endTime } = req.body;
    console.log('解析后的参数:', { adminUserId, adminUserName, regularUserId, regularUserName, invitationCode, jobPositionId, jobPositionName, bookingDate, startTime, endTime });
    
    if (!adminUserId || !regularUserName || !bookingDate || !startTime || !endTime) {
      console.log('❌ 缺少必要参数');
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }

    console.log('✅ 检查是否已经存在预约...');
    const [existingBookings] = await pool.execute(
      `SELECT id FROM bookings 
       WHERE admin_user_id = ? 
         AND booking_date = ? 
         AND start_time = ? 
         AND status = 'confirmed'`,
      [adminUserId, bookingDate, startTime]
    );
    console.log('已存在预约数量:', (existingBookings as any[]).length);

    if ((existingBookings as any[]).length > 0) {
      console.log('❌ 该时间段已被预约');
      return res.status(400).json({ success: false, error: '该时间段已被预约' });
    }

    console.log('✅ 开始插入预约记录...');
    const [result] = await pool.execute(
      `INSERT INTO bookings (admin_user_id, admin_user_name, regular_user_id, regular_user_name,
                              invitation_code, booking_date, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [adminUserId, adminUserName || '', regularUserId, regularUserName, invitationCode || '', bookingDate, startTime, endTime]
    );

    const insertResult = result as any;
    const bookingId = insertResult.insertId;
    console.log('✅ 预约记录插入成功, bookingId:', bookingId);

    let feishuEventId = null;
    let feishuMeetingUrl = null;

    console.log('========== 开始处理飞书API ==========');
    try {
      console.log('尝试从数据库获取 User Access Token...');
      let token = await getUserAccessTokenFromDB(adminUserId);
      
      if (!token) {
        console.log('数据库中没有 User Access Token，跳过飞书API调用');
      } else {
        console.log('获取 User Access Token 成功，创建飞书日程...');
        
        // 获取面试者个人介绍
        let userIntroduction = '';
        if (invitationCode) {
          try {
            console.log('尝试从 invitation_codes 表获取面试者个人介绍...');
            const [introductionRows] = await pool.execute(
              'SELECT used_by_introduction FROM invitation_codes WHERE code = ?',
              [invitationCode]
            );
            
            if (Array.isArray(introductionRows) && introductionRows.length > 0) {
              const introData = introductionRows[0] as any;
              userIntroduction = introData.used_by_introduction || '';
              console.log('获取到面试者个人介绍:', userIntroduction);
            }
          } catch (introErr) {
            console.error('获取面试者个人介绍失败:', introErr.message);
          }
        }
        
        // 第一步：先创建飞书日程（暂时不设置description）
        const result = await createFeishuEvent(
          token,
          `面试-${regularUserName}-${jobPositionName || '未知岗位'}`,
          `${bookingDate}T${startTime}+08:00`,
          `${bookingDate}T${endTime}+08:00`,
          adminUserId,
          req.body.calendarId,
          req.body.color,
          ''  // 暂时不设置description
        );

        const event = result.event;
        const feishuCalendarId = result.calendarId;
        feishuEventId = event?.event_id || event?.id || null;
        // 尝试从多个可能的字段获取会议链接
        feishuMeetingUrl = event?.meeting_url || 
                          event?.vc_url || 
                          event?.join_url || 
                          event?.vchat?.meeting_url || 
                          event?.vchat?.vc_url || 
                          event?.vchat?.join_url ||
                          event?.video_conference?.meeting_url ||
                          event?.video_conference?.vc_url ||
                          event?.video_conference?.join_url ||
                          null;
        console.log('✅ 飞书日程创建成功:', { feishuEventId, feishuMeetingUrl, feishuCalendarId, fullEvent: event });

        // 第二步：如果有会议链接，更新日程的description，添加会议链接
        if (feishuMeetingUrl && feishuEventId) {
          try {
            console.log('========== 开始更新飞书日程description ==========');
            console.log('会议链接:', feishuMeetingUrl);
            console.log('用户简介:', userIntroduction);
            
            // 构建新的description
            const newDescription = `飞书会议链接： ${feishuMeetingUrl} 
个人简介：${userIntroduction || '暂无个人简介'}`;
            
            console.log('新的description:', newDescription);
            
            // 更新飞书日程
            const updateRes = await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars/${feishuCalendarId}/events/${feishuEventId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                description: newDescription
              })
            });
            
            console.log('更新飞书日程响应状态:', updateRes.status);
            const updateData = await updateRes.json();
            console.log('更新飞书日程响应:', JSON.stringify(updateData, null, 2));
            
            if (updateData.code === 0) {
              console.log('✅ 飞书日程description更新成功');
            } else {
              console.error('⚠️ 飞书日程description更新失败:', updateData.msg);
            }
          } catch (updateErr: any) {
            console.error('⚠️ 更新飞书日程description失败(不影响预约):', updateErr.message);
          }
        }

        if (feishuEventId || feishuMeetingUrl || feishuCalendarId) {
          console.log('更新预约记录，添加飞书信息...');
          await pool.execute(
            `UPDATE bookings SET feishu_event_id=?, feishu_meeting_url=?, feishu_calendar_id=? WHERE id=?`,
            [feishuEventId, feishuMeetingUrl, feishuCalendarId, bookingId]
          );
          console.log('✅ 预约记录更新成功');
        }
      }
    } catch (feishuErr: any) {
      console.error('⚠️ 飞书API调用失败(不影响预约):', feishuErr.message);
    }

    console.log('========== 返回成功响应 ==========');
    const responseData = {
      id: bookingId,
      bookingDate,
      startTime,
      endTime,
      feishuEventId,
      feishuMeetingUrl
    };
    console.log('响应数据:', JSON.stringify(responseData, null, 2));

    res.status(201).json({
      success: true,
      data: responseData
    });
  } catch (error: any) {
    console.error('❌ 创建预约失败:', error.message);
    console.error('错误堆栈:', error.stack);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: '该时间段已被预约' });
    }
    res.status(500).json({ success: false, error: '服务器内部错误，请稍后重试' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { adminUserId, regularUserId, startDate, endDate } = req.query;
    console.log('========== 获取预约列表请求 ==========');
    console.log('查询参数:', { adminUserId, regularUserId, startDate, endDate });
    
    if (!adminUserId && !regularUserId) {
      return res.status(400).json({ success: false, error: '缺少 adminUserId 或 regularUserId 参数' });
    }

    let query: string;
    let params: any[];

    if (adminUserId) {
      let dateCondition = 'AND b.booking_date >= CURDATE()';
      if (startDate && endDate) {
        dateCondition = 'AND b.booking_date >= ? AND b.booking_date <= ?';
      }
      
      query = `
        SELECT b.id, b.regular_user_name as regularUserName, DATE_FORMAT(b.booking_date, '%Y-%m-%d') as bookingDate,
               DATE_FORMAT(b.start_time, '%H:%i') as startTime, DATE_FORMAT(b.end_time, '%H:%i') as endTime,
               b.feishu_meeting_url as feishuMeetingUrl, b.status, b.created_at as createdAt,
               i.used_by_gender as gender, i.used_by_age as age, i.used_by_phone as phone,
               i.used_by_files as files, i.used_by_introduction as introduction,
               i.job_position_name as jobPositionName
         FROM bookings b
         LEFT JOIN invitation_codes i ON b.invitation_code = i.code
         WHERE b.admin_user_id = ? AND b.status = 'confirmed'
         ${dateCondition}
         ORDER BY b.booking_date ASC, b.start_time ASC
      `;
      
      params = [adminUserId];
      if (startDate && endDate) {
        params.push(startDate, endDate);
      }
    } else {
      query = `
        SELECT b.id, b.admin_user_name as adminUserName, DATE_FORMAT(b.booking_date, '%Y-%m-%d') as bookingDate,
               DATE_FORMAT(b.start_time, '%H:%i') as startTime, DATE_FORMAT(b.end_time, '%H:%i') as endTime,
               b.feishu_meeting_url as feishuMeetingUrl, b.status, b.created_at as createdAt
         FROM bookings b
         WHERE b.regular_user_id = ? AND b.status = 'confirmed'
         ORDER BY b.booking_date DESC, b.start_time DESC
         LIMIT 1
      `;
      params = [regularUserId];
    }

    console.log('SQL查询:', query);
    console.log('查询参数:', params);
    
    const [rows] = await pool.execute(query, params);
    console.log('查询到的预约数量:', (rows as any[]).length);
    console.log('查询结果:', JSON.stringify(rows, null, 2));
    
    // 解析JSON文件数组
    const processedRows = (rows as any[]).map(row => {
      const newRow: any = { ...row };
      
      if (newRow.files) {
        if (typeof newRow.files === 'string') {
          try {
            newRow.files = JSON.parse(newRow.files);
            if (!Array.isArray(newRow.files)) {
              newRow.files = [];
            }
          } catch (e) {
            newRow.files = [];
          }
        } else if (!Array.isArray(newRow.files)) {
          newRow.files = [];
        }
      } else {
        newRow.files = [];
      }
      
      return newRow;
    });
    
    console.log('返回预约数据:', JSON.stringify(processedRows, null, 2));
    res.json({ success: true, data: processedRows });
  } catch (error: any) {
    console.error('获取预约列表失败:', error.message);
    console.error('获取预约列表失败详细信息:', error);
    res.status(500).json({ success: false, error: '服务器内部错误，请稍后重试' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 获取预约记录的详细信息
    const [rows] = await pool.execute(
      `SELECT admin_user_id, feishu_event_id, feishu_calendar_id FROM bookings WHERE id=? AND status='confirmed'`,
      [id]
    ) as any[];

    if (rows.length > 0) {
      const booking = rows[0];
      
      // 如果有飞书事件ID，尝试删除飞书日程
      if (booking.feishu_event_id) {
        try {
          console.log('========== 开始删除飞书日程 ==========');
          console.log('预约ID:', id);
          console.log('飞书日历ID:', booking.feishu_calendar_id);
          console.log('飞书事件ID:', booking.feishu_event_id);
          
          // 获取用户访问令牌
          const token = await getUserAccessTokenFromDB(booking.admin_user_id);
          
          if (token) {
            // 使用保存的日历ID，如果没有则使用primary
            const calendarId = booking.feishu_calendar_id || 'primary';
            console.log('使用日历ID:', calendarId);
            
            const deleteRes = await fetch(`${FEISHU_BASE_URL}/calendar/v4/calendars/${calendarId}/events/${booking.feishu_event_id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('删除飞书日程响应状态:', deleteRes.status);
            
            if (deleteRes.ok) {
              console.log('✅ 飞书日程删除成功');
            } else {
              const errorData = await deleteRes.json();
              console.error('⚠️ 飞书日程删除失败:', errorData);
            }
          } else {
            console.log('⚠️ 无法获取用户访问令牌，跳过删除飞书日程');
          }
        } catch (feishuErr: any) {
          console.error('⚠️ 删除飞书日程失败(不影响取消预约):', feishuErr.message);
        }
      }
    }

    // 删除预约记录
    await pool.execute(`DELETE FROM bookings WHERE id=?`, [id]);
    console.log('✅ 预约记录删除成功');
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ 取消预约失败:', error.message);
    console.error('取消预约失败详细信息:', error);
    res.status(500).json({ success: false, error: '服务器内部错误，请稍后重试' });
  }
});

export default router;
