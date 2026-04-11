import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { feishuService, TimeRange } from '../utils/feishu';

interface Slot {
  id: string;
  day?: number;
  date?: string;
  startTime: string;
  endTime: string;
}

const UserBooking: React.FC = () => {
  const { t } = useLanguage();
  const [invitationCode, setInvitationCode] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', email: '' });
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success' | 'error'>('idle');
  const [bookedEvent, setBookedEvent] = useState<any>(null);
  const [adminName, setAdminName] = useState('');

  // 姓名脱敏处理
  const maskName = (name: string) => {
    if (!name) return '';
    return name.charAt(0) + '*';
  };

  // 模拟从后端获取管理员配置
  const getAdminConfig = () => {
    // 这里为了演示，尝试从 localStorage 获取（模拟同一个环境下的管理员设置）
    // 实际应用中应该通过 API 根据邀请码查询
    const keys = Object.keys(localStorage);
    
    // 先检查新格式的邀请码列表
    for (const key of keys) {
      if (key.startsWith('invitation_codes_')) {
        const userId = key.replace('invitation_codes_', '');
        const codes = JSON.parse(localStorage.getItem(key) || '[]');
        
        // 查找匹配的、未过期的邀请码
        const matchedCode = codes.find((c: any) => 
          c.code === invitationCode && new Date(c.expiresAt) > new Date()
        );
        
        if (matchedCode) {
          const regularSlots = JSON.parse(localStorage.getItem(`slots_regular_${userId}`) || '[]');
          const specificSlots = JSON.parse(localStorage.getItem(`slots_specific_${userId}`) || '[]');
          
          // 获取管理员名字 (实际应从后端获取)
          const adminInfo = JSON.parse(localStorage.getItem(`feishu_user_info_${userId}`) || '{}');
          setAdminName(adminInfo.name || '面试官');
          
          return { userId, regularSlots, specificSlots };
        }
      }
    }
    
    // 向后兼容旧格式的单个邀请码
    for (const key of keys) {
      if (key.startsWith('invitation_code_')) {
        const code = localStorage.getItem(key);
        if (code === invitationCode) {
          const userId = key.replace('invitation_code_', '');
          const regularSlots = JSON.parse(localStorage.getItem(`slots_regular_${userId}`) || '[]');
          const specificSlots = JSON.parse(localStorage.getItem(`slots_specific_${userId}`) || '[]');
          
          // 获取管理员名字 (实际应从后端获取)
          const adminInfo = JSON.parse(localStorage.getItem(`feishu_user_info_${userId}`) || '{}');
          setAdminName(adminInfo.name || '面试官');
          
          return { userId, regularSlots, specificSlots };
        }
      }
    }
    return null;
  };

  const validateCode = async () => {
    const config = getAdminConfig();
    if (config) {
      setIsValidated(true);
      loadAvailableSlots(config);
    } else {
      alert('邀请码无效');
    }
  };

  const loadAvailableSlots = async (config: any) => {
    setLoading(true);
    try {
      const now = new Date();
      const end = new Date();
      end.setDate(now.getDate() + 7); // 查询未来 7 天

      // 1. 获取管理员忙闲
      const busyTimes = await feishuService.getFreeBusy(
        now.toISOString(),
        end.toISOString(),
        config.userId
      );

      // 2. 生成所有潜在时段
      const slots: any[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(now.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const day = date.getDay();

        // 常驻时段
        config.regularSlots.forEach((s: Slot) => {
          if (s.day === day) {
            slots.push({ ...s, date: dateStr });
          }
        });

        // 特定日期时段
        config.specificSlots.forEach((s: Slot) => {
          if (s.date === dateStr) {
            slots.push(s);
          }
        });
      }

      // 3. 过滤掉忙碌时段
      const filtered = slots.filter(slot => {
        const slotStart = new Date(`${slot.date}T${slot.startTime}:00`).getTime();
        const slotEnd = new Date(`${slot.date}T${slot.endTime}:00`).getTime();
        
        return !busyTimes.some((busy: any) => {
          const busyStart = new Date(busy.start_time).getTime();
          const busyEnd = new Date(busy.end_time).getTime();
          return (slotStart < busyEnd && slotEnd > busyStart);
        });
      });

      setAvailableSlots(filtered);
    } catch (err) {
      console.error('加载时间段失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (slot: any) => {
    if (!userInfo.name || !userInfo.phone) {
      alert('请填写个人信息');
      return;
    }

    setBookingStatus('booking');
    try {
      const summary = `面试预约: ${userInfo.name} (${userInfo.phone})`;
      const start = `${slot.date}T${slot.startTime}:00+08:00`;
      const end = `${slot.date}T${slot.endTime}:00+08:00`;
      
      const adminConfig = getAdminConfig();
      const event = await feishuService.createMeeting(summary, start, end, adminConfig!.userId);
      
      setBookedEvent(event);
      setBookingStatus('success');
      
      // 记录到 Cookie (模拟)
      document.cookie = `booked_event=${event.event_id}; max-age=86400; path=/`;
      
      // 保存预约信息供管理员查看
      const bookings = JSON.parse(localStorage.getItem(`bookings_${adminConfig!.userId}`) || '[]');
      bookings.push({ ...userInfo, slot, eventId: event.event_id });
      localStorage.setItem(`bookings_${adminConfig!.userId}`, JSON.stringify(bookings));
      
    } catch (err) {
      console.error('预约失败:', err);
      setBookingStatus('error');
    }
  };

  const handleCancel = async () => {
    if (!bookedEvent) return;
    try {
      await feishuService.cancelMeeting(bookedEvent.event_id);
      setBookingStatus('idle');
      setBookedEvent(null);
      alert(t('interview.cancelSuccess'));
    } catch (err) {
      alert('取消失败');
    }
  };

  if (bookingStatus === 'success') {
    return (
      <div className="text-center py-12">
        <div className="mb-4 text-green-500">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">{t('interview.success')}</h2>
        <p className="text-gray-500 mb-8">会议链接已同步至管理员日历</p>
        <button
          onClick={handleCancel}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          {t('interview.cancel')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      {!isValidated ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('interview.invitationCode')}</label>
            <input
              type="text"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
              placeholder={t('interview.inputCode')}
            />
          </div>
          <button
            onClick={validateCode}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            下一步
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">{t('interview.interviewer')}</p>
              <p className="text-lg font-bold text-blue-900">{maskName(adminName)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">{t('interview.userInfo')}</h3>
            <input
              type="text"
              placeholder={t('interview.name')}
              value={userInfo.name}
              onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              className="block w-full border-gray-300 rounded-md p-2 border"
            />
            <input
              type="tel"
              placeholder={t('interview.phone')}
              value={userInfo.phone}
              onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
              className="block w-full border-gray-300 rounded-md p-2 border"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">{t('interview.timeSlot')}</h3>
            {loading ? (
              <p className="text-gray-500 text-sm">加载中...</p>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id + slot.date}
                    onClick={() => handleBooking(slot)}
                    className="text-left p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="font-medium text-gray-900">{slot.date}</div>
                    <div className="text-sm text-gray-500">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">{t('interview.noSlots')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBooking;
