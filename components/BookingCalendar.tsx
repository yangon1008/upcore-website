import React, { useState, useMemo } from 'react';
import { AvailableSlotData } from '../utils/database';

interface BookingCalendarSlot {
  id: number;
  date: Date;
  dayIndex: number;
  startTime: string;
  endTime: string;
  top: number;
  height: number;
  isBooked: boolean;
  bookedByName?: string | null;
  originalSlot: AvailableSlotData;
}

interface BookingCalendarProps {
  slots: AvailableSlotData[];
  selectedSlotId?: number | null;
  onSlotSelect?: (slot: AvailableSlotData) => void;
  currentDate: Date;
  onCurrentDateChange?: (date: Date) => void;
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const ROW_HEIGHT = 60;

const BookingCalendar: React.FC<BookingCalendarProps> = ({ slots, selectedSlotId, onSlotSelect, currentDate, onCurrentDateChange }) => {
  const [internalDate, setInternalDate] = useState<Date>(currentDate);

  // 当外部传入的 currentDate 变化时，更新内部状态
  React.useEffect(() => {
    setInternalDate(currentDate);
  }, [currentDate]);

  const setCurrentDate = (date: Date) => {
    setInternalDate(date);
    onCurrentDateChange?.(date);
  };

  const weekDates = useMemo(() => {
    const date = new Date(internalDate);
    const dayOfWeek = date.getDay();
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - dayOfWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return d;
    });
  }, [internalDate]);

  const calendarSlots = useMemo<BookingCalendarSlot[]>(() => {
    const results: BookingCalendarSlot[] = [];

    slots.forEach((slot) => {
      const slotDate = new Date(slot.date);
      slotDate.setHours(0, 0, 0, 0);

      const weekStart = new Date(weekDates[0]);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekDates[6]);
      weekEnd.setHours(23, 59, 59, 999);

      if (slotDate >= weekStart && slotDate <= weekEnd) {
        const dayIndex = slotDate.getDay();
        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
        const [endHour, endMinute] = slot.endTime.split(':').map(Number);

        const top = (startHour + startMinute / 60) * ROW_HEIGHT;
        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        const height = (durationMinutes / 60) * ROW_HEIGHT;

        results.push({
          id: slot.id,
          date: slotDate,
          dayIndex,
          startTime: slot.startTime,
          endTime: slot.endTime,
          top,
          height,
          isBooked: !!slot.isBooked,
          bookedByName: slot.bookedByName,
          originalSlot: slot,
        });
      }
    });

    return results;
  }, [slots, weekDates]);

  const isToday = (date: Date) => {
    const check = new Date(date);
    check.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return check.getTime() === today.getTime();
  };

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

  const weekRangeText = useMemo(() => {
    if (weekDates.length === 0) return '';
    const start = weekDates[0];
    const end = weekDates[6];
    const startMonth = start.getMonth() + 1;
    const endMonth = end.getMonth() + 1;
    if (startMonth === endMonth) {
      return `${start.getFullYear()}年${startMonth}月${start.getDate()}日 - ${end.getDate()}日`;
    }
    return `${start.getFullYear()}年${startMonth}月${start.getDate()}日 - ${end.getFullYear()}年${endMonth}月${end.getDate()}日`;
  }, [weekDates]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full" style={{ minHeight: '600px' }}>
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
          <span className="text-base font-semibold text-gray-800 min-w-[220px] text-center">
            {weekRangeText}
          </span>
        </div>

        {/* 图例 */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-4 rounded border-l-[3px] border-blue-500 bg-blue-50/80"></div>
            <span className="text-gray-600">可预约</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-4 rounded border-l-[3px] border-gray-400 bg-gray-100"></div>
            <span className="text-gray-600">已预约</span>
          </div>
        </div>
      </div>

      {/* 日历主体 */}
      <div className="flex flex-col" style={{ height: 'calc(600px - 57px)' }}>
        {/* 固定顶部头行 */}
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

        {/* 滚动区域 */}
        <div className="flex-1 overflow-auto" style={{ scrollbarWidth: 'thin' }}>
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

            {/* 右侧日期网格区 */}
            <div className="relative flex-1">
              {/* 格子行 */}
              {HOURS.map((hour) => (
                <div key={hour} className="flex" style={{ height: `${ROW_HEIGHT}px` }}>
                  {weekDates.map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="border-r border-gray-100 last:border-r-0"
                      style={{ width: `${100 / 7}%`, height: `${ROW_HEIGHT}px` }}
                    ></div>
                  ))}
                </div>
              ))}

              {/* 时段块渲染 */}
              {calendarSlots.map((calSlot) => {
                const isSelected = calSlot.id === selectedSlotId;
                const dayWidthPercent = 100 / 7;
                // 如果已预约且有面试者名字，增加高度来显示两行内容
                const slotHeight = calSlot.isBooked && calSlot.bookedByName 
                  ? Math.max(calSlot.height, 44) 
                  : Math.max(calSlot.height, 24);

                return (
                  <div
                    key={calSlot.id}
                    className={`
                      absolute z-10 rounded px-2 py-1 text-xs font-medium transition-all overflow-hidden
                      ${calSlot.isBooked
                        ? 'bg-gray-100 border-l-[3px] border-gray-400 text-gray-500 cursor-not-allowed opacity-70'
                        : isSelected
                          ? 'bg-blue-500 border-l-[3px] border-blue-700 text-white shadow-md'
                          : 'bg-blue-50/80 border-l-[3px] border-blue-500 text-blue-700 cursor-pointer hover:bg-blue-100 hover:shadow-sm'
                      }
                    `}
                    style={{
                      left: `${calSlot.dayIndex * dayWidthPercent}%`,
                      width: `${dayWidthPercent}%`,
                      top: `${calSlot.top}px`,
                      height: `${slotHeight}px`,
                      transform: 'translateZ(0)',
                    }}
                    onClick={() => !calSlot.isBooked && onSlotSelect?.(calSlot.originalSlot)}
                    title={
                      calSlot.isBooked
                        ? `已预约: ${calSlot.bookedByName || ''}`
                        : `可预约时段: ${calSlot.originalSlot.startTime.slice(0, 5)}-${calSlot.originalSlot.endTime.slice(0, 5)}`
                    }
                  >
                    <div className="truncate">
                      <span>{calSlot.originalSlot.startTime.slice(0, 5)}-{calSlot.originalSlot.endTime.slice(0, 5)}</span>
                    </div>
                    {calSlot.isBooked && calSlot.bookedByName && (
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
    </div>
  );
};

export default BookingCalendar;
