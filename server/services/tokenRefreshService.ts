import { pool } from '../db/connection';

const FEISHU_BASE_URL = 'https://open.feishu.cn/open-apis';
const FEISHU_APP_ID = process.env.FEISHU_APP_ID || '';
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || '';

// 刷新令牌的提前时间（分钟）- 在令牌过期前 10 分钟刷新
const REFRESH_BEFORE_MINUTES = 10;

// 定时刷新间隔（毫秒）- 每小时检查一次
const REFRESH_INTERVAL = 60 * 60 * 1000;

async function getAppAccessToken() {
  try {
    const res = await fetch(`${FEISHU_BASE_URL}/auth/v3/app_access_token/internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET })
    });
    
    const data = await res.json();
    if (data.code === 0) return data.app_access_token;
    throw new Error(`获取 App Access Token 失败: ${data.msg}`);
  } catch (error: any) {
    console.error('获取 App Access Token 异常:', error.message);
    throw error;
  }
}

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

export async function refreshExpiringTokens() {
  console.log('========== 开始检查并刷新即将过期的令牌 ==========');
  
  try {
    const now = new Date();
    const refreshThreshold = new Date(now.getTime() + REFRESH_BEFORE_MINUTES * 60 * 1000);
    
    const [rows] = await pool.execute(
      `SELECT user_id, feishu_user_access_token, feishu_user_refresh_token, feishu_token_expires_at 
       FROM user_info 
       WHERE feishu_user_access_token IS NOT NULL 
         AND feishu_user_refresh_token IS NOT NULL
         AND feishu_token_expires_at IS NOT NULL`,
      []
    );
    
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log('没有需要刷新的令牌');
      return;
    }
    
    console.log(`找到 ${rows.length} 个用户的令牌，检查是否需要刷新...`);
    
    let refreshedCount = 0;
    let failedCount = 0;
    
    for (const userRow of rows as any[]) {
      const userId = userRow.user_id;
      const refreshToken = userRow.feishu_user_refresh_token;
      const expiresAt = new Date(userRow.feishu_token_expires_at);
      
      console.log(`检查用户 ${userId} 的令牌: 过期时间 ${expiresAt.toISOString()}`);
      
      if (expiresAt <= refreshThreshold) {
        console.log(`用户 ${userId} 的令牌即将过期或已过期，开始刷新...`);
        
        try {
          const newTokens = await refreshFeishuUserAccessToken(refreshToken);
          await saveFeishuTokensToDB(
            userId,
            newTokens.access_token,
            newTokens.refresh_token,
            newTokens.expires_in
          );
          refreshedCount++;
          console.log(`用户 ${userId} 的令牌刷新成功`);
        } catch (refreshError: any) {
          failedCount++;
          console.error(`用户 ${userId} 的令牌刷新失败:`, refreshError.message);
        }
      }
    }
    
    console.log(`========== 令牌刷新完成 ==========`);
    console.log(`成功刷新: ${refreshedCount} 个`);
    console.log(`刷新失败: ${failedCount} 个`);
    
  } catch (error: any) {
    console.error('令牌刷新异常:', error.message);
    console.error('令牌刷新异常详细信息:', error);
  }
}

let refreshInterval: NodeJS.Timeout | null = null;

export function startTokenRefreshService() {
  console.log('========== 启动令牌刷新服务 ==========');
  console.log(`刷新间隔: ${REFRESH_INTERVAL / 1000 / 60} 分钟`);
  console.log(`提前刷新时间: ${REFRESH_BEFORE_MINUTES} 分钟`);
  
  // 立即执行一次
  refreshExpiringTokens();
  
  // 设置定时任务
  refreshInterval = setInterval(() => {
    refreshExpiringTokens();
  }, REFRESH_INTERVAL);
  
  console.log('令牌刷新服务已启动');
}

export function stopTokenRefreshService() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('令牌刷新服务已停止');
  }
}

// 手动刷新单个用户的令牌
export async function refreshUserToken(userId: string) {
  console.log(`========== 手动刷新用户 ${userId} 的令牌 ==========`);
  
  try {
    const [rows] = await pool.execute(
      `SELECT feishu_user_refresh_token 
       FROM user_info 
       WHERE user_id = ? AND feishu_user_refresh_token IS NOT NULL`,
      [userId]
    );
    
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('未找到用户或用户没有刷新令牌');
    }
    
    const refreshToken = (rows[0] as any).feishu_user_refresh_token;
    const newTokens = await refreshFeishuUserAccessToken(refreshToken);
    
    await saveFeishuTokensToDB(
      userId,
      newTokens.access_token,
      newTokens.refresh_token,
      newTokens.expires_in
    );
    
    console.log(`用户 ${userId} 的令牌手动刷新成功`);
    return true;
    
  } catch (error: any) {
    console.error(`手动刷新用户 ${userId} 的令牌失败:`, error.message);
    throw error;
  }
}