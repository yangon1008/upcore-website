import { verifyCode, getInvitationCodeUserInfo } from './database';

// 扩展ImportMeta类型
declare interface ImportMeta {
  env: {
    VITE_FEISHU_APP_ID: string;
    VITE_FEISHU_APP_SECRET: string;
    VITE_FEISHU_REDIRECT_URI?: string;
  };
}

// 从环境变量中获取配置
const APP_ID = (import.meta as unknown as ImportMeta).env.VITE_FEISHU_APP_ID || '';
const APP_SECRET = (import.meta as unknown as ImportMeta).env.VITE_FEISHU_APP_SECRET || '';



// 动态获取当前域名作为重定向基础，若环境变量中有设置则优先使用
const REDIRECT_URI = (import.meta as unknown as ImportMeta).env.VITE_FEISHU_REDIRECT_URI || `${window.location.origin}/interview`;

// 使用后端服务器地址访问飞书 API
const BASE_URL = '/api/feishu'

export interface FeishuUser {
  type: 'feishu';
  name: string;
  avatar_url: string;
  open_id: string;
  union_id: string;
  user_id: string;
  mobile?: string;
  email?: string;
  en_name?: string;
  enterprise_email?: string;
  employee_no?: string;
}

export interface RegularUser {
  type: 'regular';
  name: string;
  gender: string;
  age: string;
  phone: string;
  invitationCode: string;
  userId: string;
}

export type User = FeishuUser | RegularUser;

export interface TimeRange {
  start: string; // ISO8601
  end: string;   // ISO8601
}

class FeishuService {
  private app_token: string | null = null;
  private user_token: string | null = null;
  private user_refresh_token: string | null = null;

  constructor() {
    this.user_token = localStorage.getItem('feishu_user_token');
    this.user_refresh_token = localStorage.getItem('feishu_user_refresh_token');
  }

  // 获取应用访问凭证
  async getAppAccessToken() {
    const res = await fetch(`${BASE_URL}/auth/app-access-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: APP_ID,
        app_secret: APP_SECRET
      })
    });
    const data = await res.json();
    if (data.code === 0) {
      this.app_token = data.app_access_token;
      return this.app_token;
    }
    throw new Error(`获取 App Access Token 失败: ${data.msg}`);
  }

  // 生成 OAuth 登录链接
  getLoginUrl() {
    const state = Math.random().toString(36).substring(7);
    // 飞书登录页面应直接访问，不走本地代理
    const feishuAuthUrl = 'https://open.feishu.cn/open-apis/authen/v1/index';
    return `${feishuAuthUrl}?app_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
  }

  // 获取用户访问凭证
  async getUserAccessToken(code: string) {
    const app_token = await this.getAppAccessToken();
    const res = await fetch(`${BASE_URL}/auth/user-access-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${app_token}`
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code
      })
    });
    const data = await res.json();
    if (data.code === 0) {
      this.user_token = data.data.access_token;
      this.user_refresh_token = data.data.refresh_token;
      localStorage.setItem('feishu_user_token', this.user_token!);
      localStorage.setItem('feishu_user_refresh_token', this.user_refresh_token!);
      return {
        access_token: data.data.access_token,
        refresh_token: data.data.refresh_token,
        expires_in: data.data.expires_in
      };
    }
    throw new Error(`获取 User Access Token 失败: ${data.msg}`);
  }

  // 获取用户信息
  async getUserInfo() {
    if (!this.user_token) return null;
    const res = await fetch(`${BASE_URL}/auth/user-info`, {
      headers: {
        'Authorization': `Bearer ${this.user_token}`
      }
    });
    const data = await res.json();
    if (data.code === 0) {
      return { 
        ...data.data, 
        type: 'feishu',
        avatar_url: data.data.avatar_url || data.data.avatar_big || data.data.avatar_middle || data.data.avatar_thumb
      } as FeishuUser;
    }
    return null;
  }

  // 获取日历忙闲状态
  async getFreeBusy(timeMin: string, timeMax: string, userId: string) {
    const app_token = await this.getAppAccessToken();
    const res = await fetch(`${BASE_URL}/calendar/freebusy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${app_token}`
      },
      body: JSON.stringify({
        time_min: timeMin,
        time_max: timeMax,
        user_id: userId,
        user_id_type: 'user_id'
      })
    });
    const data = await res.json();
    if (data.code === 0) {
      return data.data.freebusy_list[0].freebusy;
    }
    throw new Error(`获取忙闲信息失败: ${data.msg}`);
  }

  // 创建日程及会议
  async createMeeting(summary: string, startTime: string, endTime: string, userId: string) {
    const user_token = this.user_token;
    if (!user_token) throw new Error('未登录');

    // 1. 创建日程
    const eventRes = await fetch(`${BASE_URL}/calendar/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user_token}`
      },
      body: JSON.stringify({
        summary: summary,
        start_time: {
          date_time: startTime
        },
        end_time: {
          date_time: endTime
        },
        vchat: {
          vc_type: 'lark_vc'
        }
      })
    });
    const eventData = await eventRes.json();
    if (eventData.code !== 0) {
      throw new Error(`创建日程失败: ${eventData.msg}`);
    }

    return eventData.data.event;
  }

  // 取消日程
  async cancelMeeting(eventId: string) {
    const user_token = this.user_token;
    if (!user_token) throw new Error('未登录');

    const res = await fetch(`${BASE_URL}/calendar/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user_token}`
      }
    });
    const data = await res.json();
    if (data.code !== 0) {
      throw new Error(`取消日程失败: ${data.msg}`);
    }
    return true;
  }

  logout() {
    this.user_token = null;
    this.user_refresh_token = null;
    localStorage.removeItem('feishu_user_token');
    localStorage.removeItem('feishu_user_refresh_token');
    localStorage.removeItem('regular_user');
  }

  // 验证邀请码并登录普通用户
  async loginWithInvitationCode(code: string, userName: string): Promise<RegularUser> {
    const result = await verifyCode(code, userName);

    // 尝试从 invitation_codes 表加载用户已保存的信息
    let savedUserInfo: any = null;
    try {
      savedUserInfo = await getInvitationCodeUserInfo(code);
    } catch (err) {
      console.log('没有找到已保存的用户信息，使用默认值');
    }

    const regularUser: RegularUser = {
      type: 'regular',
      name: userName,
      gender: savedUserInfo?.gender || '',
      age: savedUserInfo?.age || '',
      phone: savedUserInfo?.phone || '',
      invitationCode: result.codeInfo.code,
      userId: result.userId
    };

    localStorage.setItem('regular_user', JSON.stringify(regularUser));
    return regularUser;
  }

  // 获取当前登录的普通用户
  getRegularUser(): RegularUser | null {
    const userData = localStorage.getItem('regular_user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  }

  // 普通用户登出
  logoutRegularUser() {
    const user = this.getRegularUser();
    if (user) {
      localStorage.removeItem('regular_user');
    }
  }
}

export const feishuService = new FeishuService();

