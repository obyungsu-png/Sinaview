import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';

export function CalendarWidget() {
  // 실시간 중국 시간 상태
  const [chinaTime, setChinaTime] = useState(new Date());
  
  // 중국 시간 계산 (UTC+8)
  const getChinaTime = () => {
    const now = new Date();
    // UTC 시간으로 변환 후 중국 시간대(+8시간) 적용
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 8));
  };

  // 1초마다 중국 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setChinaTime(getChinaTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 현재 중국 날짜 기준으로 달력 표시
  const [currentDate, setCurrentDate] = useState(getChinaTime());
  
  // 중국 시간으로 업데이트
  useEffect(() => {
    setCurrentDate(getChinaTime());
  }, []);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = currentDate.getDate();
  
  const currentMonth = `${year}년 ${month + 1}월`;
  
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  
  // 해당 월의 첫날과 마지막 날 계산
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  
  // 달력 그리드 생성
  const generateCalendar = () => {
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = Array(firstDay).fill(null);
    
    for (let day = 1; day <= lastDate; day++) {
      currentWeek.push(day);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };
  
  const calendar = generateCalendar();

  // 2025년 12월 중국 공휴일 (12월에는 특별한 공휴일 없음)
  const holidays: number[] = [];
  
  // 중국 음력 공휴일 정보 (12월의 주요 날짜들)
  const lunarEvents = [
    { date: 25, name: '성탄절', type: 'western' },
    { date: 31, name: '신년 전야', type: 'western' }
  ];
  
  // 요일 계산
  const getDayOfWeek = (day: number) => {
    const date = new Date(year, month, day);
    const dayIndex = date.getDay();
    return ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][dayIndex];
  };
  
  // 이전 달로 이동
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold">달력</h2>
        <button className="text-sm text-gray-500 hover:text-gray-700">
          캘린더 &gt;
        </button>
      </div>

      {/* 실시간 중국 시간 표시 */}
      <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-yellow-50 rounded-lg border border-red-200">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <Clock className="w-4 h-4 text-red-600" />
          <span className="text-xs text-gray-600">중국 시간 (UTC+8)</span>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {chinaTime.toLocaleTimeString('ko-KR', { 
              hour12: false,
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {chinaTime.toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={goToPrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium">{currentMonth}</span>
          <Button variant="ghost" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
          {daysOfWeek.map((day, index) => (
            <div 
              key={day} 
              className={`py-1 ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1">
          {calendar.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1 text-center">
              {week.map((day, dayIndex) => {
                if (!day) return <div key={`${weekIndex}-${dayIndex}`} className="py-1" />;
                
                const isToday = day === today;
                const isHoliday = holidays.includes(day);
                const isSunday = dayIndex === 0;
                const isSaturday = dayIndex === 6;
                const hasEvent = lunarEvents.some(e => e.date === day);
                
                return (
                  <button
                    key={`${weekIndex}-${dayIndex}-${day}`}
                    className={`
                      py-1 text-xs rounded hover:bg-gray-100 transition-colors
                      ${isToday ? 'bg-green-600 text-white font-semibold' : ''}
                      ${isHoliday && !isToday ? 'text-red-500 font-medium' : ''}
                      ${isSunday && !isToday && !isHoliday ? 'text-red-500' : ''}
                      ${isSaturday && !isToday && !isHoliday ? 'text-blue-500' : ''}
                      ${hasEvent && !isToday ? 'font-medium' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Today's Date */}
        <div className="pt-3 border-t text-center">
          <div className="text-2xl font-semibold text-green-600">{month + 1}.{today}</div>
          <div className="text-xs text-gray-500">{getDayOfWeek(today)}</div>
        </div>

        {/* Upcoming Events */}
        <div className="pt-3 border-t space-y-2">
          <div className="text-xs text-gray-600">
            {lunarEvents.map((event, index) => (
              <div key={index} className="flex justify-between items-center mt-1">
                <span>• {month + 1}/{event.date} {event.name}</span>
                <span className="text-blue-500">기념일</span>
              </div>
            ))}
            {lunarEvents.length === 0 && (
              <div className="text-center text-gray-400">이번 달 공휴일 없음</div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}