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
  booking?: BookingData;
  groupIndex?: number; // 在重叠组中的索引
  groupSize?: number; // 重叠组的大小
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

  // 预约详情弹窗状态
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);

  // 日期选择器状态
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [pickerViewDate, setPickerViewDate] = useState<Date>(new Date());

  // 滚动 ref
  const gridRef = useRef<HTMLDivElement>(null);

  // 拖拽相关状态
  const [draggingSlotId, setDraggingSlotId] = useState<string | number | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // 拖拽时的临时数据
  const dragDataRef = useRef<{
    originalSlot: CalendarSlot;
    startMinutes: number;
    durationMinutes: number;
    originalDayIndex: number;
  } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);
  const shakeIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    // 第一步：生成所有时段
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
          
          // 优先用 slotId 匹配（新数据），如果没有 slotId 则用日期和时间匹配（兼容历史数据）
          const booking = bookings.find(
            b => (b.slotId && slot.id && b.slotId === slot.id) ||
                 (!b.slotId && normalizeDate(b.bookingDate) === slotDateStr && normalizeTime(b.startTime) === slotTimeNorm)
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
            booking,
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
        
        // 优先用 slotId 匹配（新数据），如果没有 slotId 则用日期和时间匹配（兼容历史数据）
        const booking = bookings.find(
          b => (b.slotId && slot.id && b.slotId === slot.id) ||
               (!b.slotId && normalizeDate(b.bookingDate) === slotDateStr && normalizeTime(b.startTime) === slotTimeNorm)
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
          booking,
        });
      }
    });
    
    // 第二步：检测重叠时段并分组
    // 按天索引分组
    const slotsByDay: { [dayIndex: number]: CalendarSlot[] } = {};
    results.forEach(slot => {
      if (!slotsByDay[slot.dayIndex]) {
        slotsByDay[slot.dayIndex] = [];
      }
      slotsByDay[slot.dayIndex].push(slot);
    });

    // 对每一天的时段进行重叠检测和分组
    Object.keys(slotsByDay).forEach(dayIndexStr => {
      const dayIndex = Number(dayIndexStr);
      const daySlots = slotsByDay[dayIndex];
      
      // 按时段开始时间排序
      daySlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      
      // 找出重叠的时段组
      const overlappingGroups: CalendarSlot[][] = [];
      const usedSlots = new Set<CalendarSlot>();
      
      daySlots.forEach(slot => {
        if (usedSlots.has(slot)) return;
        
        // 查找与此时段重叠的其他时段（时间重叠）
        const overlapping: CalendarSlot[] = [slot];
        usedSlots.add(slot);
        
        daySlots.forEach(otherSlot => {
          if (slot === otherSlot || usedSlots.has(otherSlot)) return;
          
          // 检查时间是否重叠
          const slotStart = slot.startTime.getTime();
          const slotEnd = slot.endTime.getTime();
          const otherStart = otherSlot.startTime.getTime();
          const otherEnd = otherSlot.endTime.getTime();
          
          // 时间重叠检测
          if (
            (slotStart < otherEnd && slotEnd > otherStart) ||
            (otherStart < slotEnd && otherEnd > slotStart)
          ) {
            overlapping.push(otherSlot);
            usedSlots.add(otherSlot);
          }
        });
        
        overlappingGroups.push(overlapping);
      });
      
      // 设置每个时段的分组信息
      overlappingGroups.forEach(group => {
        group.forEach((slot, index) => {
          slot.groupSize = group.length;
          slot.groupIndex = index;
        });
      });
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

  // 辅助函数：时间字符串转换为分钟
  const timeToMinutes = (time: string) => {
    const { hour, minute } = parseTime(time);
    return hour * 60 + minute;
  };

  // 辅助函数：分钟转换为时间字符串
  const minutesToTime = (totalMinutes: number) => {
    const hour = Math.floor(totalMinutes / 60) % 24;
    const minute = totalMinutes % 60;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  // 辅助函数：15分钟吸附
  const snapTo15Minutes = (minutes: number) => {
    return Math.round(minutes / 15) * 15;
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
    const clickedMinute = Math.round(minuteOffset / 30) * 30;

    const clickedDate = weekDates[dayIndex];
    const startHour = hour;
    const startMinute = clickedMinute >= 60 ? 0 : clickedMinute;
    const adjustedStartHour = clickedMinute >= 60 ? startHour + 1 : startHour;

    // 默认时长为30分钟
    let endHour = adjustedStartHour;
    let endMinute = startMinute + 30;
    
    if (endMinute >= 60) {
      endMinute = endMinute - 60;
      endHour = endHour + 1;
    }
    
    if (endHour >= 24) {
      endHour = 23;
      endMinute = 59;
    }

    openCreateDialog(clickedDate, adjustedStartHour, startMinute, endHour, endMinute, dayIndex);
  };

  // 点击时段块显示编辑对话框
  const handleSlotClick = (calendarSlot: CalendarSlot, event: React.MouseEvent) => {
    event.stopPropagation();
    clearLongPressTimer();

    // 如果是长按触发的，则不处理点击
    if (isLongPressTriggeredRef.current || draggingSlotId !== null) {
      return;
    }

    // 已预约的时段不可编辑
    if (calendarSlot.isBooked) {
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

  // 清除长按定时器
  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // 开始拖拽
  const startDrag = (slot: CalendarSlot, e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const startMinutes = timeToMinutes(slot.originalSlot.startTime);
    const durationMinutes = timeToMinutes(slot.originalSlot.endTime) - startMinutes;

    dragDataRef.current = {
      originalSlot: slot,
      startMinutes,
      durationMinutes,
      originalDayIndex: slot.dayIndex
    };

    setDragStartPos({ x: clientX, y: clientY });
    setDraggingSlotId(slot.id);
    setIsDragging(false);
  };

  // 鼠标/触摸按下 - 开始长按检测
  const handleSlotMouseDown = (slot: CalendarSlot, e: React.MouseEvent | React.TouchEvent) => {
    if (slot.isBooked) return;

    e.stopPropagation();
    e.preventDefault();

    isLongPressTriggeredRef.current = false;
    setIsShaking(false);
    setDragOffset({ x: 0, y: 0 });

    // 设置长按定时器
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setIsShaking(true);
      startDrag(slot, e);
    }, 500);
  };

  // 鼠标/触摸移动
  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!dragStartPos || !dragDataRef.current || draggingSlotId === null) return;

    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

    const offsetX = clientX - dragStartPos.x;
    const offsetY = clientY - dragStartPos.y;

    setDragOffset({ x: offsetX, y: offsetY });

    if (!isDragging && (Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5)) {
      setIsDragging(true);
      setIsShaking(false); // 开始拖动时停止晃动
    }
  };

  // 鼠标/触摸释放
  const handleDragEnd = async () => {
    clearLongPressTimer();

    if (isDragging && dragDataRef.current && draggingSlotId !== null) {
      // 计算新的时间
      const { originalSlot, startMinutes, durationMinutes, originalDayIndex } = dragDataRef.current;

      // 计算垂直偏移对应的分钟数
      const minutesPerPixel = 60 / ROW_HEIGHT;
      const totalMinuteOffset = dragOffset.y * minutesPerPixel;

      // 15分钟吸附
      const snappedStartMinutes = snapTo15Minutes(startMinutes + totalMinuteOffset);

      // 边界处理
      let newStartMinutes = Math.max(0, Math.min(24 * 60 - durationMinutes, snappedStartMinutes));
      let newEndMinutes = newStartMinutes + durationMinutes;

      // 计算水平偏移对应的天数
      const dayWidthPercent = 100 / 7;
      const gridRect = gridRef.current?.getBoundingClientRect();
      const gridWidth = gridRect?.width || 1;
      const pixelsPerDay = gridWidth / 7;
      const dayOffset = Math.round(dragOffset.x / pixelsPerDay);

      let newDayIndex = originalDayIndex + dayOffset;
      newDayIndex = Math.max(0, Math.min(6, newDayIndex));

      // 更新数据
      const updatedSlot: SlotData = {
        ...originalSlot.originalSlot,
        startTime: minutesToTime(newStartMinutes),
        endTime: minutesToTime(newEndMinutes),
        ...(originalSlot.originalSlot.slotType === 'regular'
          ? { dayOfWeek: newDayIndex }
          : { slotDate: weekDates[newDayIndex].toISOString().split('T')[0] })
      };

      try {
        if (adminUserId && updatedSlot.id) {
          await updateSlot(updatedSlot.id, updatedSlot);
        }
        const newSlots = displaySlots.map(s =>
          s.id === originalSlot.originalSlot.id ? updatedSlot : s
        );
        onSlotChange?.(newSlots);
      } catch (err: any) {
        alert('更新时段失败: ' + err.message);
      }
    }

    // 重置状态
    setDraggingSlotId(null);
    setDragStartPos(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setIsShaking(false);
    dragDataRef.current = null;
    isLongPressTriggeredRef.current = false;
  };



  // 添加全局拖拽事件监听
  useEffect(() => {
    if (dragStartPos) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
      window.addEventListener('touchcancel', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    };
  }, [dragStartPos, isDragging, dragOffset]);

  // 晃动动画效果 - 一直晃动直到开始拖动
  const [shakeToggle, setShakeToggle] = useState(false);

  useEffect(() => {
    if (isShaking && !isDragging && draggingSlotId !== null) {
      shakeIntervalRef.current = setInterval(() => {
        setShakeToggle(prev => !prev);
      }, 150);
    } else {
      if (shakeIntervalRef.current) {
        clearInterval(shakeIntervalRef.current);
        shakeIntervalRef.current = null;
      }
    }

    return () => {
      if (shakeIntervalRef.current) {
        clearInterval(shakeIntervalRef.current);
      }
    };
  }, [isShaking, isDragging, draggingSlotId]);

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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative" style={{ minHeight: '600px' }}>
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
            className="absolute inset-0 z-[99] bg-transparent"
            onClick={() => setShowDatePicker(false)}
          />

          {/* 月份日历浮层 - 完全遮挡下方内容 */}
          <div
            className="absolute z-[100] bg-white rounded-xl shadow-2xl p-5 w-[340px]"
            style={{
              top: '60px',
              left: '35%',
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
                const isDraggingThis = draggingSlotId === calSlot.id;
                const groupSize = calSlot.groupSize || 1;
                const groupIndex = calSlot.groupIndex || 0;

                // 计算拖拽时的位置
                let currentLeft = calSlot.dayIndex * dayWidthPercent + (groupIndex / groupSize) * dayWidthPercent;
                let currentWidth = dayWidthPercent / groupSize;
                let currentTop = calSlot.top;
                let displayStartTime = calSlot.originalSlot.startTime.slice(0, 5);
                let displayEndTime = calSlot.originalSlot.endTime.slice(0, 5);

                if (isDraggingThis && dragDataRef.current) {
                  const { startMinutes, durationMinutes, originalDayIndex } = dragDataRef.current;
                  const gridRect = gridRef.current?.getBoundingClientRect();
                  const gridWidth = gridRect?.width || 1;
                  const pixelsPerDay = gridWidth / 7;
                  const dayOffset = Math.round(dragOffset.x / pixelsPerDay);
                  let newDayIndex = originalDayIndex + dayOffset;
                  newDayIndex = Math.max(0, Math.min(6, newDayIndex));
                  currentLeft = newDayIndex * dayWidthPercent;
                  currentWidth = dayWidthPercent; // 拖拽时使用完整宽度

                  const minutesPerPixel = 60 / ROW_HEIGHT;
                  const totalMinuteOffset = dragOffset.y * minutesPerPixel;
                  const snappedStartMinutes = snapTo15Minutes(startMinutes + totalMinuteOffset);
                  let newStartMinutes = Math.max(0, Math.min(24 * 60 - durationMinutes, snappedStartMinutes));
                  let newEndMinutes = newStartMinutes + durationMinutes;
                  currentTop = (newStartMinutes / 60) * ROW_HEIGHT;

                  displayStartTime = minutesToTime(newStartMinutes);
                  displayEndTime = minutesToTime(newEndMinutes);
                }

                return (
                  <React.Fragment key={calSlot.id}>
                    <div
                      data-slot-id={calSlot.id}
                      className={`absolute z-10 rounded px-2 py-1 text-xs font-medium transition-all overflow-hidden ${
                        isBooked
                          ? 'bg-gray-100 border-l-[3px] border-gray-400 text-gray-500 cursor-pointer hover:bg-gray-200 hover:shadow-md'
                          : isSpecific
                            ? 'bg-blue-50/80 border-l-[3px] border-blue-500 text-blue-700 cursor-pointer hover:bg-blue-100 hover:shadow-md hover:scale-[1.02]'
                            : 'bg-green-50/80 border-l-[3px] border-green-500 text-green-700 cursor-pointer hover:bg-green-100 hover:shadow-md hover:scale-[1.02]'
                      } ${
                        (isShaking && isDraggingThis && !isDragging)
                          ? 'shadow-2xl scale-[1.05] z-30'
                          : isDraggingThis
                          ? 'shadow-2xl z-30'
                          : ''
                      }`}
                      style={{
                        left: `${currentLeft}%`,
                        width: `${currentWidth}%`,
                        top: `${currentTop}px`,
                        height: `${Math.max(calSlot.height, 24)}px`,
                        cursor: isBooked ? 'pointer' : 'grab',
                        transform: isShaking && isDraggingThis && !isDragging && shakeToggle
                          ? 'translateZ(0) rotate(-1deg) translateX(-2px)'
                          : isShaking && isDraggingThis && !isDragging && !shakeToggle
                          ? 'translateZ(0) rotate(1deg) translateX(2px)'
                          : 'translateZ(0)',
                      }}
                      title={
                        isBooked
                          ? `已预约: ${calSlot.bookedByName || ''} - 点击查看详情`
                          : `${isSpecific ? '特定日期' : '常驻'}时段: ${calSlot.originalSlot.startTime.slice(0, 5)}-${calSlot.originalSlot.endTime.slice(0, 5)} - 长按可拖拽`
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isBooked && calSlot.booking) {
                          setSelectedBooking(calSlot.booking);
                          setShowBookingDetail(true);
                        } else if (!isBooked) {
                          handleSlotClick(calSlot, e);
                        }
                      }}
                      onMouseDown={(e) => !isBooked && handleSlotMouseDown(calSlot, e)}
                      onTouchStart={(e) => !isBooked && handleSlotMouseDown(calSlot, e)}
                      onMouseUp={clearLongPressTimer}
                      onTouchEnd={clearLongPressTimer}
                      onTouchCancel={clearLongPressTimer}
                      onMouseLeave={clearLongPressTimer}
                    >
                      <div className="flex items-start justify-between w-full">
                        <span className="truncate">{displayStartTime}-{displayEndTime}</span>
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
                  </React.Fragment>
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
          className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
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

      {/* 预约详情弹窗 */}
      {showBookingDetail && selectedBooking && (
        <>
          {/* 透明遮罩层 - 点击关闭 */}
          <div
            className="fixed inset-0 z-49 bg-transparent"
            onClick={() => {
              setShowBookingDetail(false);
              setSelectedBooking(null);
            }}
          />

          {/* 预约详情弹窗 */}
          <div
            className="fixed z-50 bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[150vh] overflow-y-auto"
            style={{
              top: '26%',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">面试者详细信息</h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowBookingDetail(false);
                  setSelectedBooking(null);
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">姓名</h4>
                <p className="text-gray-900">{selectedBooking.regularUserName}</p>
              </div>

              {selectedBooking.jobPositionName && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">面试岗位</h4>
                  <p className="text-gray-900">{selectedBooking.jobPositionName}</p>
                </div>
              )}

              {selectedBooking.gender && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">性别</h4>
                  <p className="text-gray-900">{selectedBooking.gender}</p>
                </div>
              )}

              {selectedBooking.age && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">年龄</h4>
                  <p className="text-gray-900">{selectedBooking.age}</p>
                </div>
              )}

              {selectedBooking.phone && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">手机号</h4>
                  <p className="text-gray-900">{selectedBooking.phone}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500">预约时间</h4>
                <p className="text-gray-900">
                  {selectedBooking.bookingDate} {selectedBooking.startTime.slice(0, 5)}-{selectedBooking.endTime.slice(0, 5)}
                </p>
              </div>

              {selectedBooking.feishuMeetingUrl && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">会议链接</h4>
                  <a
                    href={selectedBooking.feishuMeetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {selectedBooking.feishuMeetingUrl}
                  </a>
                </div>
              )}

              {selectedBooking.introduction && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">个人介绍</h4>
                  <p className="text-gray-900">{selectedBooking.introduction}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowBookingDetail(false);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InterviewCalendar;
