import { useEffect, useState } from 'react';
import { Sun, ChevronDown } from 'lucide-react';
import { fetchMorningBriefing, MorningBriefing } from '../utils/aiContent';

/**
 * 아침 브리핑 - 매일 오전 8시(중국 시간) AI 자동 작성: 환율 + 도시별 날씨 + 오늘의 소식
 * 평소에는 한 줄로 접어 두고, 누르면 전체가 펼쳐진다.
 */
export function MorningBriefingCard() {
  const [data, setData] = useState<MorningBriefing | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { fetchMorningBriefing().then(setData); }, []);
  if (!data || (!data.rate && !data.weather.length && !data.lines.length)) return null;

  const diff = data.rate?.prev ? data.rate.krwPerCny - data.rate.prev : null;
  const showDiff = diff !== null && Math.abs(diff) >= 0.01;
  const [, month, day] = data.date.split('.');
  const firstWeather = data.weather[0];

  return (
    <div className="bg-white rounded-2xl lg:rounded-xl border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full text-left px-4 py-3 lg:px-4 lg:py-3 lg:flex lg:items-center lg:gap-2"
      >
        {/* 휴대폰: 제목 줄 + 환율·날씨 줄 (두 줄로 나눠 잘리지 않게) */}
        <span className="flex items-center gap-2 lg:contents">
          <Sun className="w-5 h-5 text-orange-500 shrink-0" />
          <span className="text-[17px] lg:text-base font-bold lg:font-semibold text-gray-900 shrink-0">
            <span className="hidden lg:inline">{Number(month)}월 {Number(day)}일 </span>아침 브리핑
          </span>
          <span className="lg:hidden text-[13.5px] text-gray-500">{Number(month)}월 {Number(day)}일</span>
          <ChevronDown className={`lg:hidden ml-auto w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
        {!open && (
          <span className="lg:hidden mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15.5px] text-gray-800">
            {data.rate && (
              <span>
                1위안 <b className="font-semibold">{data.rate.krwPerCny.toFixed(2)}원</b>
                {showDiff && (
                  <span className={diff! > 0 ? 'text-red-500' : 'text-blue-500'}> {diff! > 0 ? '▲' : '▼'}{Math.abs(diff!).toFixed(2)}</span>
                )}
              </span>
            )}
            {firstWeather && <span className="text-gray-600">{firstWeather.city} {firstWeather.desc} {firstWeather.min}~{firstWeather.max}°</span>}
          </span>
        )}
        {/* PC: 한 줄 */}
        <span className={`hidden lg:block flex-1 min-w-0 truncate text-sm text-gray-500 ${open ? 'invisible' : ''}`}>
          {data.rate && (
            <>
              1위안 {data.rate.krwPerCny.toFixed(2)}원
              {showDiff && (
                <span className={diff! > 0 ? 'text-red-500' : 'text-blue-500'}> {diff! > 0 ? '▲' : '▼'}{Math.abs(diff!).toFixed(2)}</span>
              )}
            </>
          )}
          {firstWeather && <> · {firstWeather.city} {firstWeather.desc} {firstWeather.min}~{firstWeather.max}°</>}
          {data.lines[0] && <> · {data.lines[0]}</>}
        </span>
        <ChevronDown className={`hidden lg:block w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 lg:pb-4 -mt-0.5">
          {data.rate && (
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-[13.5px] lg:text-sm text-gray-500">원/위안 환율</span>
              <span className="text-[16.5px] lg:text-base font-semibold text-gray-900">1위안 = {data.rate.krwPerCny.toFixed(2)}원</span>
              {showDiff && (
                <span className={`text-[12px] lg:text-sm ${diff! > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                  {diff! > 0 ? '▲' : '▼'} {Math.abs(diff!).toFixed(2)}
                </span>
              )}
            </div>
          )}

          {data.weather.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {data.weather.map(w => (
                <span key={w.city} className="text-[14px] lg:text-xs bg-gray-50 border border-gray-100 rounded-full px-3 py-1 text-gray-700">
                  {w.city} {w.desc} {w.min}~{w.max}°
                </span>
              ))}
            </div>
          )}

          {data.lines.length > 0 && (
            <ul className="space-y-1.5">
              {data.lines.map((line, i) => (
                <li key={i} className="text-[15.5px] lg:text-sm text-gray-800 leading-relaxed flex gap-1.5">
                  <span className="text-orange-500">•</span>{line}
                </li>
              ))}
            </ul>
          )}
          <p className="text-[12.5px] lg:text-[11px] text-gray-500 mt-2.5">{Number(month)}월 {Number(day)}일 · 매일 오전 8시(중국 시간) AI가 자동 작성합니다.</p>
        </div>
      )}
    </div>
  );
}
