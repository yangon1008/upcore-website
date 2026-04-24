import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { feishuService, FeishuUser, RegularUser, User } from '../utils/feishu';
import { saveFeishuToken } from '../utils/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginFeishu: () => void;
  loginWithInvitationCode: (code: string, userName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      // 首先检查是否有普通用户登录
      const regularUser = feishuService.getRegularUser();
      if (regularUser) {
        setUser(regularUser);
        setLoading(false);
        return;
      }

      // 检查是否有 OAuth callback code
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        // 保存 code 到临时变量
        const authCode = code;
        
        // 清除 URL 中的 code
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // 使用 code 获取用户访问凭证
        const tokenInfo = await feishuService.getUserAccessToken(authCode);
        
        // 获取用户信息
        const userInfo = await feishuService.getUserInfo();
        if (userInfo) {
          // 保存飞书令牌到后端
          try {
            await saveFeishuToken(
              userInfo.user_id,
              tokenInfo.access_token,
              tokenInfo.refresh_token,
              tokenInfo.expires_in,
              userInfo.name,
              userInfo.avatar_url,
              userInfo.mobile,
              userInfo.email,
              userInfo.open_id
            );
            console.log('飞书令牌保存成功');
          } catch (tokenErr) {
            console.error('保存飞书令牌失败:', tokenErr);
          }
          
          setUser({ ...userInfo, type: 'feishu' });
          setLoading(false);
          return;
        }
      }

      // 然后检查是否有已存在的飞书用户（通过 localStorage 中的 token）
      const userInfo = await feishuService.getUserInfo();
      if (userInfo) {
        // 如果本地有 token 但后端没有，尝试保存到后端
        const localToken = localStorage.getItem('feishu_user_token');
        const localRefreshToken = localStorage.getItem('feishu_user_refresh_token');
        if (localToken) {
          try {
            await saveFeishuToken(
              userInfo.user_id, 
              localToken, 
              localRefreshToken || undefined,
              undefined,
              userInfo.name,
              userInfo.avatar_url,
              userInfo.mobile,
              userInfo.email,
              userInfo.open_id
            );
          } catch (tokenErr) {
            console.error('保存现有飞书令牌失败:', tokenErr);
          }
        }
        
        setUser({ ...userInfo, type: 'feishu' });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginFeishu = () => {
    window.location.href = feishuService.getLoginUrl();
  };

  const loginWithInvitationCode = async (code: string, userName: string) => {
    try {
      const regularUser = await feishuService.loginWithInvitationCode(code, userName);
      setUser(regularUser);
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    feishuService.logout();
    feishuService.logoutRegularUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginFeishu, loginWithInvitationCode, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
