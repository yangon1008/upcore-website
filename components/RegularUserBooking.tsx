import React, { useState, useEffect } from 'react';
import { RegularUser } from '../utils/feishu';
import { verifyCode, getAvailableSlots, createBooking, cancelBooking, getUserBooking, getJobPositions, AvailableSlotData, CreateBookingResult, VerifyResult, UserBookingData, JobPositionData } from '../utils/database';

interface RegularUserBookingProps {
  user: RegularUser;
  onRefresh?: () => void;
}

const RegularUserBooking: React.FC<RegularUserBookingProps> = ({ user, onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<{ adminUserId: string; adminUserName: string } | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlotData[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPositionData[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlotData | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<JobPositionData | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success' | 'error'>('idle');
  const [bookingResult, setBookingResult] = useState<CreateBookingResult | null>(null);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      // 首先检查用户是否已有预约
      const existingBooking = await getUserBooking(user.userId);
      if (existingBooking) {
        // 如果已有预约，直接显示预约成功页面
        setBookingResult({
          id: existingBooking.id,
          bookingDate: existingBooking.bookingDate,
          startTime: existingBooking.startTime,
          endTime: existingBooking.endTime,
          feishuEventId: null, // 后端没有返回这个字段，但前端不使用
          feishuMeetingUrl: existingBooking.feishuMeetingUrl
        });
        setBookingStatus('success');
        setError('');
        setAdminInfo({ adminUserId: '', adminUserName: existingBooking.adminUserName });
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // 如果没有预约，继续加载可预约时间和岗位
      const result: VerifyResult = await verifyCode(user.invitationCode, user.name, user.gender, user.age, user.phone);
      setAdminInfo({ adminUserId: result.codeInfo.adminUserId, adminUserName: result.codeInfo.adminUserName });

      const [slots, positions] = await Promise.all([
        getAvailableSlots(result.codeInfo.adminUserId),
        getJobPositions(result.codeInfo.adminUserId)
      ]);
      setAvailableSlots(slots);
      setJobPositions(positions);
      
      if (slots.length > 0) {
        const firstDate = [...new Set(slots.map(s => s.date))].sort()[0];
        setSelectedDate(firstDate);
      }
      setError('');
    } catch (err: any) {
      setError(err.message || '获取信息失败');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (onRefresh) {
      (window as any).regularUserBookingRefresh = refresh;
    }
  }, [onRefresh]);

  const handleBook = async () => {
    if (!selectedSlot || !adminInfo || !selectedPosition) return;
    setBookingStatus('booking');
    setError('');
    try {
      const result = await createBooking({
        adminUserId: adminInfo.adminUserId,
        adminUserName: adminInfo.adminUserName,
        regularUserId: user.userId,
        regularUserName: user.name,
        invitationCode: user.invitationCode,
        jobPositionId: selectedPosition.id,
        jobPositionName: selectedPosition.positionName,
        bookingDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      });
      setBookingResult(result);
      setBookingStatus('success');
    } catch (err: any) {
      setError(err.message || '预约失败');
      setBookingStatus('error');
    }
  };

  const handleCancel = async () => {
    if (!bookingResult) return;
    try {
      await cancelBooking(bookingResult.id);
      setBookingStatus('idle');
      setBookingResult(null);
      setSelectedSlot(null);
      init();
    } catch (_err) {
      alert('取消失败');
    }
  };

  const maskName = (name: string) => name ? name.charAt(0) + '*' : '';

  const uniqueDates = [...new Set(availableSlots.map(slot => slot.date))].sort();
  const slotsByDate: Record<string, AvailableSlotData[]> = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, AvailableSlotData[]>);

  const currentSlots = selectedDate ? (slotsByDate[selectedDate] || []) : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">正在加载可预约时间...</p>
      </div>
    );
  }

  if (error && !adminInfo) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (bookingStatus === 'success' && bookingResult) {
    return (
      <div className="max-w-lg mx-auto text-center py-8 space-y-6">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">预约成功!</h2>

        <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-left">
          <div className="flex justify-between">
            <span className="text-gray-500">面试官</span>
            <span className="font-medium">{adminInfo?.adminUserName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">时间</span>
            <span className="font-medium">{bookingResult.bookingDate} {bookingResult.startTime}-{bookingResult.endTime}</span>
          </div>
          {bookingResult.feishuMeetingUrl && (
            <div className="pt-2 border-t">
              <span className="text-gray-500 block mb-2">会议链接</span>
              <a href={bookingResult.feishuMeetingUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                加入视频会议
              </a>
            </div>
          )}
        </div>

        <button onClick={handleCancel} className="text-red-600 hover:text-red-800 font-medium transition-colors">
          取消预约
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-600 font-medium">面试官</p>
          <p className="text-lg font-bold text-blue-900">{maskName(adminInfo?.adminUserName || '')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-600 font-medium">您的姓名</p>
          <p className="text-lg font-bold text-blue-900">{user.name}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          选择面试岗位
        </h3>

        {jobPositions.length > 0 ? (
          <div className="space-y-2">
            {jobPositions.filter(p => p.isActive).map((position) => (
              <button
                key={position.id}
                onClick={() => setSelectedPosition(selectedPosition?.id === position.id ? null : position)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedPosition?.id === position.id
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-lg font-semibold text-gray-900">{position.positionName}</div>
                {position.description && (
                  <div className="text-sm text-gray-500 mt-1">{position.description}</div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-400">暂无面试岗位</p>
            <p className="text-gray-400 text-sm mt-1">请联系管理员添加面试岗位</p>
          </div>
        )}

        <h3 className="font-medium text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          选择预约日期
        </h3>

        {uniqueDates.length > 0 ? (
          <>
            <div className="overflow-x-auto pb-2">
              <div className="flex space-x-2 min-w-max">
                {uniqueDates.map((date) => {
                  const firstSlot = slotsByDate[date][0];
                  return (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedSlot(null);
                      }}
                      className={`px-2 py-1.5 rounded-lg border-2 transition-all flex-shrink-0 ${
                        selectedDate === date
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900">{firstSlot.displayDate}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{slotsByDate[date].length} 场可约</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && currentSlots.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-600">可预约场次</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentSlots.map((slot) => (
                    <button
                      key={`${slot.date}_${slot.startTime}`}
                      onClick={() => setSelectedSlot(selectedSlot?.date === slot.date && selectedSlot?.startTime === slot.startTime ? null : slot)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selectedSlot?.date === slot.date && selectedSlot?.startTime === slot.startTime
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-lg font-semibold text-gray-900">{slot.startTime} - {slot.endTime}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400">暂无可预约的时段</p>
            <p className="text-gray-400 text-sm mt-1">请联系管理员添加可用时间段</p>
          </div>
        )}

        {error && bookingStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {selectedSlot && selectedDate && currentSlots.length > 0 && selectedPosition && (
          <button
            onClick={handleBook}
            disabled={bookingStatus === 'booking'}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg disabled:opacity-50"
          >
            {bookingStatus === 'booking' ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                预约中...
              </span>
            ) : (
              `确认预约 ${slotsByDate[selectedDate][0].displayDate} ${selectedSlot.startTime}-${selectedSlot.endTime}`
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default RegularUserBooking;
