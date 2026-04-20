import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SlotData, saveSlot, updateSlot, deleteSlot, BookingData } from '../utils/database';

interface CalendarSlot {
  id: number | string;
  slotType: 'regular' | 'specific';
  date: Date;
  dayIndex: number;
  startTime: Date;
  endTime: Date;
  top: number;
  height: number;
  originalSlot: SlotData;
  isBooked?: boolean;
  bookedByName?: string;
}

interface InterviewCalendarProps {
  slots?: SlotData[];
  onSlotChange?: (slots: SlotData[]) => void;
  adminUserId?: string;
  bookings?: BookingData[];
  currentDate?: Date;
  onCurrentDateChange?: (date: Date) => void;
}

type ViewType = 'day' | 'week' | 'month';

const InterviewCalendar: React.FC<InterviewCalendarProps> = ({ 
  slots = [], 
  onSlotChange, 
  adminUserId, 
  bookings = [], 
  currentDate: propCurrentDate, 
  onCurrentDateChange 
}) => {
  const [internalCurrentDate, setInternalCurrentDate] = useState<Date>(new Date());
  const currentDate = propCurrentDate || internalCurrentDate;
  
  const setCurrentDate = (date: Date) => {
    setInternalCurrentDate(date);
    onCurrentDateChange?.(date);
  };
  const [viewType, setViewType] = useState<ViewType>('week');

  // 对话框状态管理
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingSlot, setEditingSlot] = useState<SlotData | null>(null);

  // 日期选择器状态
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [pickerViewDate, setPickerViewDate] = useState<Date>(new Date());

  // 滚动 ref
  const gridRef = useRef<HTMLDivElement>(null);

  // 月份日历数据类型
  interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
  }

  // 生成月份日历数据
  const generateCalendarDays = useMemo((): CalendarDay[] => {
    const year = pickerViewDate.getFullYear();
    const month = pickerViewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: CalendarDay[] = [];
    const today = new Date();

    // 上月填充日期
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    // 当月日期
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: d.toDateString() === today.toDateString(),
        isSelected: d.toDateString() === tempDate.toDateString()
      });
    }

    // 下月填充至42格(6行×7列)
    for (let i = 1; days.length < 42; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    return days;
  }, [pickerViewDate, tempDate]);

  // 表单数据
  const [formData, setFormData] = useState({
    slotType: 'specific' as 'regular' | 'specific',
    slotDate: '',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00'
  });

  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const ROW_HEIGHT = 60;

  const displaySlots = slots;

  const weekDates = useMemo(() => {
    const date = new Date(currentDate);
    const dayOfWeek = date.getDay();
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - dayOfWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const weekRangeText = useMemo(() => {
    if (weekDates.length === 0) return '';
    const start = weekDates[0];
    const end = weekDates[6];
    const format = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    const startMonth = start.getMonth() + 1;
    const endMonth = end.getMonth() + 1;
    if (startMonth === endMonth) {
      return `${start.getFullYear()}年${startMonth}月${start.getDate()}日 - ${end.getDate()}日`;
    }
    return `${format(start)} - ${format(end)}`;
  }, [weekDates]);

  // 标准化时间格式的辅助函数
  const normalizeTime = (timeStr: string) => {
    // 确保时间格式为 HH:MM
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    const hour = String(parseInt(parts[0] || '0')).padStart(2, '0');
    const minute = String(parseInt(parts[1] || '0')).padStart(2, '0');
    return `${hour}:${minute}`;
  };

  // 标准化日期格式的辅助函数
  const normalizeDate = (dateStr: string) => {
    // 确保日期格式为 YYYY-MM-DD
    if (!dateStr) return '';
    // 处理可能的不同格式
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    return dateStr;
  };

  const calendarSlots = useMemo<CalendarSlot[]>(() => {
    console.log('========== InterviewCalendar 生成日历时段 ==========');
    console.log('当前 bookings 数据:', bookings);
    console.log('当前 displaySlots 数据:', displaySlots);
    
    const results: CalendarSlot[] = [];
    let bookedCount = 0;

    displaySlots.forEach((slot) => {
      if (slot.slotType === 'specific' && slot.slotDate) {
        // 解析本地日期字符串而不是依赖Date构造函数的时区处理
        const [year, month, day] = slot.slotDate.split('-').map(Number);
        const slotDate = new Date(year, month - 1, day);
        slotDate.setHours(0, 0, 0, 0);

        const weekStart = new Date(weekDates[0]);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekDates[6]);
        weekEnd.setHours(23, 59, 59, 999);

        if (slotDate >= weekStart && slotDate <= weekEnd) {
          const dayIndex = slotDate.getDay();
          const [startHour, startMinute] = slot.startTime.split(':').map(Number);
          const [endHour, endMinute] = slot.endTime.split(':').map(Number);

          const startTime = new Date(slotDate);
          startTime.setHours(startHour, startMinute, 0, 0);
          const endTime = new Date(slotDate);
          endTime.setHours(endHour, endMinute, 0, 0);

          const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
          const top = (startHour + startMinute / 60) * ROW_HEIGHT;
          const height = (durationMinutes / 60) * ROW_HEIGHT;

          // 检查是否已预约
          const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };
          const slotDateStr = formatDate(slotDate);
          const slotTimeNorm = normalizeTime(slot.startTime);
          
          console.log(`检查特定时段: ${slotDateStr} ${slot.startTime} (标准化: ${slotTimeNorm})`);
          console.log(`可用的预约数据:`, bookings.map(b => ({ 
            date: b.bookingDate, 
            time: b.startTime,
            dateNorm: normalizeDate(b.bookingDate),
            timeNorm: normalizeTime(b.startTime),
            name: b.regularUserName 
          })));
          
          const booking = bookings.find(
            b => normalizeDate(b.bookingDate) === slotDateStr && normalizeTime(b.startTime) === slotTimeNorm
          );
          
          if (booking) {
            bookedCount++;
            console.log(`✅ 找到匹配预约:`, booking);
          }

          results.push({
            id: slot.id ?? `specific-${slot.slotDate}-${slot.startTime}`,
            slotType: 'specific',
            date: slotDate,
            dayIndex,
            startTime,
            endTime,
            top,
            height,
            originalSlot: slot,
            isBooked: !!booking,
            bookedByName: booking?.regularUserName,
          });
        }
      } else if (slot.slotType === 'regular' && slot.dayOfWeek !== undefined) {
        const dayIndex = slot.dayOfWeek;
        const targetDate = new Date(weekDates[dayIndex]);

        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
        const [endHour, endMinute] = slot.endTime.split(':').map(Number);

        const startTime = new Date(targetDate);
        startTime.setHours(startHour, startMinute, 0, 0);
        const endTime = new Date(targetDate);
        endTime.setHours(endHour, endMinute, 0, 0);

        const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        const top = (startHour + startMinute / 60) * ROW_HEIGHT;
        const height = (durationMinutes / 60) * ROW_HEIGHT;

        // 检查是否已预约
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        const slotDateStr = formatDate(targetDate);
        const slotTimeNorm = normalizeTime(slot.startTime);
        
        console.log(`检查常驻时段: ${slotDateStr} ${slot.startTime} (标准化: ${slotTimeNorm}, 星期${dayIndex})`);
        
        const booking = bookings.find(
          b => normalizeDate(b.bookingDate) === slotDateStr && normalizeTime(b.startTime) === slotTimeNorm
        );
        
        if (booking) {
          bookedCount++;
          console.log(`✅ 找到匹配预约:`, booking);
        }

        results.push({
          id: slot.id ?? `regular-${dayIndex}-${slot.startTime}`,
          slotType: 'regular',
          date: targetDate,
          dayIndex,
          startTime,
          endTime,
          top,
          height,
          originalSlot: slot,
          isBooked: !!booking,
          bookedByName: booking?.regularUserName,
        });
      }
    });
    
    console.log(`总共找到 ${bookedCount} 个已预约时段`);
    console.log('生成的日历时段结果:', results);

    return results;
  }, [displaySlots, weekDates, ROW_HEIGHT, bookings]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const goToToday = () => setCurrentDate(new Date());

  const goToPrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const isToday = (date: Date) => {
    const check = new Date(date);
    check.setHours(0, 0, 0, 0);
    return check.getTime() === today.getTime();
  };

  // 辅助函数：格式化时间为 HH:mm
  const formatTime = (date: Date): string => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 辅助函数：解析时间字符串为小时和分钟
  const parseTime = (timeStr: string): { hour: number; minute: number } => {
    const [hour, minute] = timeStr.split(':').map(Number);
    return { hour, minute };
  };

  // 打开创建对话框
  const openCreateDialog = (
    date: Date,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
    dayIndex: number
  ) => {
    // 使用本地时间而不是UTC时间
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    setFormData({
      slotType: 'regular', // 默认选择常驻时段
      slotDate: dateStr,
      dayOfWeek: dayIndex,
      startTime,
      endTime
    });

    setDialogMode('create');
    setEditingSlot(null);
    setShowDialog(true);
  };

  // 表单验证
  const validateForm = (): boolean => {
    if (formData.slotType === 'specific' && !formData.slotDate) {
      alert('请选择日期');
      return false;
    }
    if (formData.startTime >= formData.endTime) {
      alert('结束时间必须晚于开始时间');
      return false;
    }
    return true;
  };

  // 创建新时段（自动保存到数据库）
  const handleCreateSlot = async () => {
    if (!validateForm()) return;

    const newSlot: SlotData = {
      slotType: formData.slotType,
      ...(formData.slotType === 'specific'
        ? { slotDate: formData.slotDate }
        : { dayOfWeek: formData.dayOfWeek }),
      startTime: formData.startTime,
      endTime: formData.endTime
    };

    try {
      if (adminUserId) {
        const result = await saveSlot({ ...newSlot, adminUserId });
        newSlot.id = result.id;
      }
      const newSlots = [...displaySlots, newSlot];
      onSlotChange?.(newSlots);
      setShowDialog(false);
    } catch (err: any) {
      alert('创建时段失败: ' + err.message);
    }
  };

  // 更新已有时段（自动保存到数据库）
  const handleUpdateSlot = async () => {
    if (!validateForm() || !editingSlot) return;

    const updatedSlot: SlotData = {
      ...editingSlot,
      slotType: formData.slotType,
      ...(formData.slotType === 'specific'
        ? { slotDate: formData.slotDate, dayOfWeek: undefined }
        : { dayOfWeek: formData.dayOfWeek, slotDate: undefined }),
      startTime: formData.startTime,
      endTime: formData.endTime
    };

    try {
      if (adminUserId && updatedSlot.id) {
        await updateSlot(updatedSlot.id, updatedSlot);
      }
      const newSlots = displaySlots.map(s =>
        s.id === editingSlot.id ? updatedSlot : s
      );
      onSlotChange?.(newSlots);
      setShowDialog(false);
      setEditingSlot(null);
    } catch (err: any) {
      alert('更新时段失败: ' + err.message);
    }
  };

  // 删除时段（自动从数据库删除）
  const handleDeleteSlot = async () => {
    if (!editingSlot) return;

    try {
      if (editingSlot.id && adminUserId) {
        await deleteSlot(editingSlot.id);
      }
      const newSlots = displaySlots.filter(s => s !== editingSlot);
      onSlotChange?.(newSlots);
      setShowDialog(false);
      setEditingSlot(null);
    } catch (err: any) {
      alert('删除失败: ' + err.message);
    }
  };

  // 点击空白格子创建时段（带坐标转换）
  const handleCellClick = (dayIndex: number, hour: number, event: React.MouseEvent) => {
    const cell = event.currentTarget;
    const rect = cell.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const minuteOffset = Math.round((clickY / rect.height) * 60);
    const clickedMinute = Math.round(minuteOffset / 15) * 15;

    const clickedDate = weekDates[dayIndex];
    const startHour = hour;
    const startMinute = clickedMinute;

    let endHour = startHour + 1;
    let endMinute = startMinute;
    if (endHour >= 24) {
      endHour = 23;
      endMinute = 59;
    }

    openCreateDialog(clickedDate, startHour, startMinute, endHour, endMinute, dayIndex);
  };

  // 点击时段块显示编辑对话框
  const handleSlotClick = (calendarSlot: CalendarSlot, event: React.MouseEvent) => {
    event.stopPropagation();

    // 已预约的时段不可编辑
    if (calendarSlot.isBooked) {
      alert(`该时段已被 ${calendarSlot.bookedByName} 预约，无法编辑`);
      return;
    }

    setEditingSlot(calendarSlot.originalSlot);
    setDialogMode('edit');

    setFormData({
      slotType: calendarSlot.originalSlot.slotType,
      slotDate: calendarSlot.originalSlot.slotDate || '',
      dayOfWeek: calendarSlot.originalSlot.dayOfWeek || 1,
      startTime: calendarSlot.originalSlot.startTime,
      endTime: calendarSlot.originalSlot.endTime
    });

    setShowDialog(true);
  };

  // ESC 键关闭对话框
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDialog) {
        setShowDialog(false);
        setEditingSlot(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showDialog]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ minHeight: '600px' }}>
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            今天
          </button>
          <div className="flex items-center space-x-1">
            <button
              onClick={goToPrevWeek}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNextWeek}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => {
              setTempDate(new Date(currentDate));
              setShowDatePicker(true);
            }}
            className="text-base font-semibold text-gray-800 min-w-[220px] text-center hover:bg-gray-100 px-2 py-1 rounded-md transition-colors cursor-pointer"
            title="点击选择日期"
          >
            {weekRangeText}
          </button>
        </div>
      </div>

      {showDatePicker && (
        <>
          {/* 透明遮罩层 - 点击关闭 */}
          <div
            className="fixed inset-0 z-[99] bg-transparent"
            onClick={() => setShowDatePicker(false)}
          />

          {/* 月份日历浮层 - 完全遮挡下方内容 */}
          <div
            className="fixed z-[100] bg-white rounded-xl shadow-2xl p-5 w-[340px]"
            style={{
              top: '70vh',
              left: '50vh',
              transform: 'translateX(-50%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 月份导航栏 */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setPickerViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <span className="text-lg font-semibold text-gray-800">
                {pickerViewDate.getFullYear()}年{pickerViewDate.getMonth() + 1}月
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPickerViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    const today = new Date();
                    setPickerViewDate(today);
                    setTempDate(today);
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  今天
                </button>
              </div>
            </div>

            {/* 星期标题栏 */}
            <div className="grid grid-cols-7 mb-2 border-b border-gray-100 pb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="text-center text-xs text-gray-500 font-semibold py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentDate(day.date);
                    setShowDatePicker(false);
                  }}
                  disabled={!day.isCurrentMonth}
                  className={`
                    w-10 h-10 text-sm rounded-full flex items-center justify-center
                    transition-all duration-150 cursor-pointer relative
                    ${!day.isCurrentMonth ? 'text-gray-300 cursor-default' : ''}
                    ${day.isToday ? 'bg-blue-500 text-white font-bold shadow-md shadow-blue-200 scale-105' : ''}
                    ${day.isSelected && !day.isToday ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
                    ${day.isCurrentMonth && !day.isToday && !day.isSelected ? 'hover:bg-gray-100 active:bg-gray-200' : ''}
                  `}
                >
                  {day.date.getDate()}
                  {day.isToday && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 日历主体 */}
      <div className="flex flex-col" style={{ height: 'calc(600px - 57px)' }}>
        {/* 固定顶部头行：时间轴占位 + 日期列（遮挡下方内容） */}
        <div className="flex-shrink-0 flex border-b border-gray-200">
          <div className="w-16 bg-gray-50"></div>
          <div className="flex-1 bg-white shadow-sm z-10">
            {weekDates.map((date, index) => (
              <div
                key={index}
                className={`inline-flex flex-col items-center justify-center py-2 ${
                  isToday(date) ? 'bg-blue-50' : ''
                }`}
                style={{ width: `${100 / 7}%` }}
              >
                <span className={`text-sm font-medium ${isToday(date) ? 'text-blue-600' : 'text-gray-700'}`}>
                  {WEEKDAYS[index]}
                </span>
                <span
                  className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isToday(date)
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 统一滚动区域：时间轴 | 日期网格(含时段块) */}
        <div
          ref={gridRef}
          className="flex-1 overflow-auto"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="flex">
            {/* 左侧时间轴 */}
            <div className="flex-shrink-0 w-16 bg-gray-50">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex items-start justify-end pr-2 text-xs text-gray-400 font-medium"
                  style={{ height: `${ROW_HEIGHT}px` }}
                >
                  {String(hour).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* 右侧日期网格区（relative 容器只包含7列） */}
            <div className="relative flex-1">
              {/* 格子行 */}
              {HOURS.map((hour) => (
                <div key={hour} className="flex" style={{ height: `${ROW_HEIGHT}px` }}>
                  {weekDates.map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="border-r border-gray-100 last:border-r-0 cursor-pointer hover:bg-blue-50/30 transition-colors"
                      style={{ width: `${100 / 7}%`, height: `${ROW_HEIGHT}px` }}
                      onClick={(e) => handleCellClick(dayIndex, hour, e)}
                    ></div>
                  ))}
                </div>
              ))}

              {/* 时段块渲染 */}
              {calendarSlots.map((calSlot) => {
                const isSpecific = calSlot.slotType === 'specific';
                const dayWidthPercent = 100 / 7;
                const isBooked = calSlot.isBooked;

                return (
                  <div
                    key={calSlot.id}
                    className={`absolute z-10 rounded px-2 py-1 text-xs font-medium transition-all overflow-hidden ${
                      isBooked
                        ? 'bg-gray-100 border-l-[3px] border-gray-400 text-gray-500 cursor-not-allowed opacity-70'
                        : isSpecific
                          ? 'bg-blue-50/80 border-l-[3px] border-blue-500 text-blue-700 cursor-pointer hover:bg-blue-100 hover:shadow-md hover:scale-[1.02]'
                          : 'bg-green-50/80 border-l-[3px] border-green-500 text-green-700 cursor-pointer hover:bg-green-100 hover:shadow-md hover:scale-[1.02]'
                    }`}
                    style={{
                      left: `${calSlot.dayIndex * dayWidthPercent}%`,
                      width: `${dayWidthPercent}%`,
                      top: `${calSlot.top}px`,
                      height: `${Math.max(calSlot.height, isBooked && calSlot.bookedByName ? 44 : 24)}px`,
                      transform: 'translateZ(0)',
                    }}
                    title={
                      isBooked
                        ? `已预约: ${calSlot.bookedByName || ''}`
                        : `${isSpecific ? '特定日期' : '常驻'}时段: ${calSlot.originalSlot.startTime.slice(0, 5)}-${calSlot.originalSlot.endTime.slice(0, 5)}`
                    }
                    onClick={(e) => !isBooked && handleSlotClick(calSlot, e)}
                  >
                    <div className="flex items-start justify-between w-full">
                      <span className="truncate">{calSlot.originalSlot.startTime.slice(0, 5)}-{calSlot.originalSlot.endTime.slice(0, 5)}</span>
                      {!isBooked && (
                        <svg className="w-3 h-3 opacity-60 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      )}
                    </div>
                    {isBooked && calSlot.bookedByName && (
                      <div className="truncate text-xs opacity-70 mt-0.5">
                        {calSlot.bookedByName}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 当前时间指示线 */}
              {(() => {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const topPosition = (currentHour + currentMinute / 60) * ROW_HEIGHT;
                const isInCurrentWeek = weekDates.some(d => isToday(d));

                if (!isInCurrentWeek) return null;

                return (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${topPosition}px` }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full ml-[-4px]"></div>
                      <div className="flex-1 h-0.5 bg-red-500"></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 创建/编辑时段对话框 */}
      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[73vh] bg-black bg-opacity-50 transition-opacity"
          onClick={() => {
            setShowDialog(false);
            setEditingSlot(null);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 对话框标题 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {dialogMode === 'create' ? '创建面试时段' : '编辑面试时段'}
              </h3>
              <button
                onClick={() => {
                  setShowDialog(false);
                  setEditingSlot(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 对话框表单内容 */}
            <div className="px-6 py-4 space-y-4">
              {/* 时段类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">时段类型</label>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="slotType"
                      value="specific"
                      checked={formData.slotType === 'specific'}
                      onChange={(e) => setFormData({ ...formData, slotType: e.target.value as 'specific' })}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">特定日期</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="slotType"
                      value="regular"
                      checked={formData.slotType === 'regular'}
                      onChange={(e) => setFormData({ ...formData, slotType: e.target.value as 'regular' })}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">常驻时段</span>
                  </label>
                </div>
              </div>

              {/* 日期字段（仅 specific 类型显示） */}
              {formData.slotType === 'specific' && (
                <div className="transition-all">
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                  <input
                    type="date"
                    value={formData.slotDate}
                    onChange={(e) => setFormData({ ...formData, slotDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              )}

              {/* 星期几字段（仅 regular 类型显示） */}
              {formData.slotType === 'regular' && (
                <div className="transition-all">
                  <label className="block text-sm font-medium text-gray-700 mb-1">星期</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {WEEKDAYS.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 开始时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* 结束时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* 对话框底部按钮 */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              {/* 删除按钮（仅编辑模式显示） */}
              {dialogMode === 'edit' && (
                <button
                  onClick={handleDeleteSlot}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                >
                  删除此时段
                </button>
              )}
              
              {dialogMode !== 'edit' && <div></div>}

              <div className="flex space-x-3 ml-auto">
                <button
                  onClick={() => {
                    setShowDialog(false);
                    setEditingSlot(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={dialogMode === 'create' ? handleCreateSlot : handleUpdateSlot}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewCalendar;
