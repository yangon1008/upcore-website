import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { FeishuUser, RegularUser } from '../utils/feishu';
import AdminPanel from './AdminPanel';
import UserProfile from './UserProfile';
import RegularUserBooking from './RegularUserBooking';
import InvitationCodeLogin from './InvitationCodeLogin';
import { getBookings, BookingData } from '../utils/database';

interface InterviewPageProps {
  onBack: () => void;
}

const InterviewPage: React.FC<InterviewPageProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { user, loading, loginFeishu, logout, refreshUser } = useAuth();
  const [view, setView] = useState<'login' | 'admin' | 'profile' | 'user' | 'bookings'>('login');
  const [loginType, setLoginType] = useState<'feishu' | 'invitation' | null>(null);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // 登录状态由 AuthContext 处理，不需要在这里处理 code 参数
  useEffect(() => {
    // 当用户登录后，根据用户类型设置默认视图
    if (!loading && user) {
      if (user.type === 'feishu') {
        setView('admin');
        setLoginType(null);
        loadBookings(user.user_id);
      } else {
        setView('user');
        setLoginType(null);
      }
    } else if (!loading && !user && !loginType) {
      setView('login');
    }
  }, [user, loading]);

  const loadBookings = async (adminUserId: string) => {
    try {
      const data = await getBookings(adminUserId);
      setBookings(data);
    } catch (err) {
      console.error('加载预约列表失败:', err);
    }
  };

  const handleLogout = () => {
    logout();
    setView('login');
    setLoginType(null);
  };

  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      if (view === 'admin') {
        // 调用 AdminPanel 的刷新方法
        if ((window as any).adminPanelRefresh) {
          await (window as any).adminPanelRefresh();
        }
      } else if (view === 'bookings') {
        await loadBookings(user.user_id);
      } else if (view === 'user') {
        // 调用 RegularUserBooking 的刷新方法
        if ((window as any).regularUserBookingRefresh) {
          await (window as any).regularUserBookingRefresh();
        }
      }
    } catch (err) {
      console.error('刷新失败:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const renderBookings = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-6">预约用户列表</h2>
      {bookings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">面试岗位</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预约时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">会议链接</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((b) => (
                <tr key={b.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedBooking(b)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.regularUserName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.jobPositionName || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-medium">{b.bookingDate}</span>
                    <span className="ml-2">{b.startTime.slice(0, 5)}-{b.endTime.slice(0, 5)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {b.feishuMeetingUrl ? (
                      <a href={b.feishuMeetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">加入会议</a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-12">暂无预约</p>
      )}

      {/* 面试者详细信息模态框 */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">面试者详细信息</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">姓名</h4>
                <p className="text-gray-900">{selectedBooking.regularUserName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">面试岗位</h4>
                <p className="text-gray-900">{selectedBooking.jobPositionName || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">性别</h4>
                <p className="text-gray-900">{selectedBooking.gender || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">年龄</h4>
                <p className="text-gray-900">{selectedBooking.age || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">手机号</h4>
                <p className="text-gray-900">{selectedBooking.phone || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">预约时间</h4>
                <p className="text-gray-900">{selectedBooking.bookingDate} {selectedBooking.startTime}-{selectedBooking.endTime}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">会议链接</h4>
                {selectedBooking.feishuMeetingUrl ? (
                  <a href={selectedBooking.feishuMeetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{selectedBooking.feishuMeetingUrl}</a>
                ) : (
                  <p className="text-gray-900">-</p>
                )}
              </div>
              {selectedBooking.resume && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">简历</h4>
                  <a href={selectedBooking.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">查看简历</a>
                </div>
              )}
              {selectedBooking.video && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">视频</h4>
                  <a href={selectedBooking.video} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">查看视频</a>
                </div>
              )}
              {selectedBooking.website && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">个人网站</h4>
                  <a href={selectedBooking.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">访问网站</a>
                </div>
              )}
              {selectedBooking.introduction && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">个人介绍</h4>
                  <p className="text-gray-900">{selectedBooking.introduction}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedBooking(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderLoginOptions = () => (
    <div className="max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">选择登录方式</h2>
        <p className="text-gray-600">请选择适合您的登录方式</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={loginFeishu}
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">飞书登录</div>
            <div className="text-sm text-gray-500">管理员使用</div>
          </div>
        </button>

        <button
          onClick={() => setLoginType('invitation')}
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">邀请码登录</div>
            <div className="text-sm text-gray-500">普通用户使用</div>
          </div>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {view === 'admin' ? t('interview.adminTitle') : 
               view === 'profile' ? t('nav.profile') : 
               view === 'bookings' ? '预约列表' : 
               view === 'user' ? '面试预约' : t('interview.title')}
            </h1>
            {user && (view === 'admin' || view === 'bookings' || view === 'user') && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>刷新中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>刷新</span>
                  </>
                )}
              </button>
            )}
            {user && user.type === 'feishu' && (
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('admin')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    view === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t('interview.adminTitle')}
                </button>
                <button
                  onClick={() => { setView('bookings'); loadBookings(user.user_id); }}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    view === 'bookings' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  预约列表
                </button>
                <button
                  onClick={() => setView('profile')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    view === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t('nav.profile')}
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {user.type === 'feishu' && (
                  <img src={(user as FeishuUser).avatar_url} alt={user.name} className="h-8 w-8 rounded-full shadow-sm" />
                )}
                {user.type === 'regular' && (
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="text-gray-700 font-medium">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors font-medium"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <></>
            )}
            {view === 'login' && loginType === 'invitation' && (
              <button
                onClick={() => setLoginType(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                返回
              </button>
            )}
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              返回首页
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 min-h-[400px]">
          {view === 'login' && !loginType ? (
            renderLoginOptions()
          ) : view === 'login' && loginType === 'invitation' ? (
            <InvitationCodeLogin onSuccess={() => setView('user')} />
          ) : view === 'admin' && user && user.type === 'feishu' ? (
            <AdminPanel user={user as FeishuUser} onRefresh={handleRefresh} />
          ) : view === 'profile' && user && user.type === 'feishu' ? (
            <UserProfile user={user as FeishuUser} onUpdate={(u) => {}} />
          ) : view === 'bookings' && user && user.type === 'feishu' ? (
            renderBookings()
          ) : view === 'user' && user && user.type === 'regular' ? (
            <RegularUserBooking user={user as RegularUser} onRefresh={handleRefresh} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
