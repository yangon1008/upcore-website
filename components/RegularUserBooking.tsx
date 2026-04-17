import React, { useState, useEffect } from 'react';
import { RegularUser } from '../utils/feishu';
import { verifyCode, getAvailableSlots, createBooking, cancelBooking, getUserBooking, getJobPositions, updateInvitationCodeInfo, getInvitationCodeUserInfo, AvailableSlotData, CreateBookingResult, VerifyResult, UserBookingData, JobPositionData } from '../utils/database';
import UserInfoForm from './UserInfoForm';

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
  const [currentStep, setCurrentStep] = useState<'info' | 'booking' | 'success'>('info');
  const [userInfo, setUserInfo] = useState<{
    gender: string;
    age: string;
    phone: string;
    jobPositionId: number;
    jobPositionName: string;
    introduction: string;
    files: any[];
  }>({
    gender: user.gender || 'male',
    age: user.age || '',
    phone: user.phone || '',
    jobPositionId: 0,
    jobPositionName: '',
    introduction: '',
    files: [] as any[]
  });
  const [invitationCodeInfo, setInvitationCodeInfo] = useState<{ expiresAt: string } | null>(null);

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
        setCurrentStep('success');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // 如果没有预约，继续加载可预约时间和岗位
      const result: VerifyResult = await verifyCode(user.invitationCode, user.name);
      setAdminInfo({ adminUserId: result.codeInfo.adminUserId, adminUserName: result.codeInfo.adminUserName });
      setInvitationCodeInfo({ expiresAt: result.codeInfo.expiresAt });

      // 尝试从 invitation_codes 表加载用户已保存的信息
      try {
        const savedUserInfo = await getInvitationCodeUserInfo(user.invitationCode);
        if (savedUserInfo) {
          setUserInfo({
            gender: savedUserInfo.gender || 'male',
            age: savedUserInfo.age || '',
            phone: savedUserInfo.phone || '',
            jobPositionId: savedUserInfo.jobPositionId || 0,
            jobPositionName: savedUserInfo.jobPositionName || '',
            introduction: savedUserInfo.introduction || '',
            files: savedUserInfo.files ? savedUserInfo.files.map((file: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              url: file.url,
              filename: file.filename || 'file',
              originalname: file.originalname || 'file',
              mimetype: file.mimetype || 'application/octet-stream',
              size: file.size || 0
            })) : [] as any[]
          });
        }
      } catch (infoErr) {
        console.log('没有找到已保存的用户信息，使用默认值');
      }

      const [positions] = await Promise.all([
        getJobPositions(result.codeInfo.adminUserId)
      ]);
      setJobPositions(positions);
      setError('');
      setCurrentStep('info');
    } catch (err: any) {
      setError(err.message || '获取信息失败');
      // 1.5秒后清除错误
      setTimeout(() => setError(''), 1500);
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

  const handleUserInfoSubmit = async (data: {
    gender: string;
    age: string;
    phone: string;
    jobPositionId: number;
    jobPositionName: string;
    introduction?: string;
    files?: any[];
  }) => {
    setLoading(true);
    try {
      setUserInfo(data);
      
      // 保存所有信息到邀请码表
      try {
        const usedByFiles = data.files && data.files.length > 0 ? data.files : undefined;
        await updateInvitationCodeInfo(user.invitationCode, {
          jobPositionId: data.jobPositionId,
          jobPositionName: data.jobPositionName,
          usedByFiles: usedByFiles,
          usedByIntroduction: data.introduction,
          usedByGender: data.gender,
          usedByAge: data.age,
          usedByPhone: data.phone
        });
      } catch (error) {
        console.error('保存用户信息失败:', error);
      }
      
      // 加载可用的面试场次
      if (adminInfo && invitationCodeInfo) {
        const slots = await getAvailableSlots(adminInfo.adminUserId);
        // 过滤出邀请码有效期内的场次
        const validSlots = slots.filter(slot => {
          const slotDate = new Date(slot.date);
          const expiresAt = new Date(invitationCodeInfo.expiresAt);
          return slotDate <= expiresAt;
        });
        setAvailableSlots(validSlots);
        if (validSlots.length > 0) {
          const firstDate = [...new Set(validSlots.map(s => s.date))].sort()[0];
          setSelectedDate(firstDate);
        }
      }
      setCurrentStep('booking');
    } catch (err: any) {
      setError(err.message || '加载场次失败');
      // 1.5秒后清除错误
      setTimeout(() => setError(''), 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot || !adminInfo) return;
    if (selectedSlot.isBooked) {
      setError('该场次已被预约');
      setTimeout(() => setError(''), 1500);
      return;
    }
    setBookingStatus('booking');
    setError('');
    try {
      const result = await createBooking({
        adminUserId: adminInfo.adminUserId,
        adminUserName: adminInfo.adminUserName,
        regularUserId: user.userId,
        regularUserName: user.name,
        invitationCode: user.invitationCode,
        jobPositionId: userInfo.jobPositionId,
        jobPositionName: userInfo.jobPositionName,
        bookingDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        files: userInfo.files
      });
      setBookingResult(result);
      setBookingStatus('success');
      setCurrentStep('success');
    } catch (err: any) {
      setError(err.message || '预约失败');
      setBookingStatus('error');
      // 1.5秒后清除错误
      setTimeout(() => setError(''), 1500);
    }
  };

  const handleCancel = async () => {
    if (!bookingResult) return;
    try {
      await cancelBooking(bookingResult.id);
      setBookingStatus('idle');
      setBookingResult(null);
      setSelectedSlot(null);
      refresh();
    } catch (_err) {
      alert('取消失败');
    }
  };

  const maskName = (name: string) => name ? name.charAt(0) + '*' : '';

  const uniqueDates: string[] = [...new Set<string>(availableSlots.map(slot => slot.date))].sort();
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

  // 步骤导航组件
  const renderStepNavigation = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'info' || currentStep === 'booking' || currentStep === 'success'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </div>
          <div className={`h-1 flex-1 mx-2 ${
            currentStep === 'info' || currentStep === 'booking' || currentStep === 'success'
              ? 'bg-blue-600'
              : 'bg-gray-200'
          }`} style={{ width: '140px' }}></div>
        </div>
        <div className="flex-1 flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'booking' || currentStep === 'success'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
          <div className={`h-1 flex-1 mx-2 ${
            currentStep === 'booking' || currentStep === 'success'
              ? 'bg-blue-600'
              : 'bg-gray-200'
          }`} style={{ width: '140px' }}></div>
        </div>
        <div className="flex items-center justify-center" style={{ width: '32px' }}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'success'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-500'
          }`}>
            3
          </div>
        </div>
      </div>
      <div className="flex mt-2 text-sm text-gray-600">
        <div className="flex-1">
          <div className={currentStep === 'info' ? 'text-blue-600 font-medium' : ''} style={{ textAlign: 'left' }}>填写个人信息</div>
        </div>
        <div className="flex-1 text-center">
          <div className={currentStep === 'booking' ? 'text-blue-600 font-medium' : ''}>选择预约时间</div>
        </div>
        <div className="flex-1">
          <div className={currentStep === 'success' ? 'text-blue-600 font-medium' : ''} style={{ textAlign: 'right' }}>预约成功</div>
        </div>
      </div>
    </div>
  );

  // 个人信息步骤
  const renderInfoStep = () => (
    <div className={currentStep === 'info' ? 'block' : 'hidden'}>
      <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-blue-600 font-medium">面试官</p>
          <p className="text-lg font-bold text-blue-900">{maskName(adminInfo?.adminUserName || '')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-600 font-medium">您的姓名</p>
          <p className="text-lg font-bold text-blue-900">{user.name}</p>
        </div>
      </div>
      
      <UserInfoForm
        jobPositions={jobPositions}
        onSubmit={handleUserInfoSubmit}
        onBack={() => {}}
        loading={loading}
        initialData={userInfo}
      />
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );

  // 预约时间步骤
  const renderBookingStep = () => (
    <div className={currentStep === 'booking' ? 'block' : 'hidden'}>
      <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between mb-6">
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
                  const totalSlots = slotsByDate[date].length;
                  const availableCount = slotsByDate[date].filter(s => !s.isBooked).length;
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
                      <div className="text-xs text-gray-500 mt-0.5">
                        {availableCount} 场可约
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && currentSlots.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-600">可预约场次</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentSlots.map((slot) => {
                    const isSelected = selectedSlot?.date === slot.date && selectedSlot?.startTime === slot.startTime;
                    const isBooked = slot.isBooked;
                    return (
                      <button
                        key={`${slot.date}_${slot.startTime}`}
                        onClick={() => {
                          if (isBooked) return;
                          setSelectedSlot(isSelected ? null : slot);
                        }}
                        disabled={isBooked}
                        className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl border-2 transition-all h-[54px] ${
                          isBooked
                            ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-75'
                            : isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`text-lg font-semibold text-center ${isBooked ? 'text-gray-500' : 'text-gray-900'}`}>
                          {slot.startTime} - {slot.endTime}
                        </div>
                        {isBooked && (
                          <div className="text-sm text-gray-400">已被预约</div>
                        )}
                      </button>
                    );
                  })}
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

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep('info')}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            上一步
          </button>
          {selectedSlot && selectedDate && currentSlots.length > 0 && (
            <button
              onClick={handleBook}
              disabled={bookingStatus === 'booking'}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {bookingStatus === 'booking' ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  预约中...
                </span>
              ) : (
                `确认预约`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // 预约成功步骤
  const renderSuccessStep = () => (
    <div className={currentStep === 'success' ? 'block' : 'hidden'}>
      <div className="text-center py-8 space-y-6">
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
            <span className="text-gray-500">面试岗位</span>
            <span className="font-medium">{userInfo.jobPositionName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">时间</span>
            <span className="font-medium">{bookingResult?.bookingDate} {bookingResult?.startTime}-{bookingResult?.endTime}</span>
          </div>
          {bookingResult?.feishuMeetingUrl && (
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

        <div className="flex space-x-4">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            取消预约
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto w-4/5 space-y-6 py-8">
      {renderStepNavigation()}
      {renderInfoStep()}
      {renderBookingStep()}
      {renderSuccessStep()}
    </div>
  );
};

export default RegularUserBooking;
