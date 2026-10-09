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
    <div className="bg-white rounded-xl border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 lg:px-4 lg:py-3 text-left"
      >
        <Sun className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500 shrink-0" />
        <span className="text-[14px] lg:text-base font-semibold text-gray-900 shrink-0">
          <span className="hidden lg:inline">{Number(month)}월 {Number(day)}일 </span>아침 브리핑
        </span>
        {/* 접혔을 때: 환율·날씨·첫 소식을 한 줄로 */}
        <span className={`flex-1 min-w-0 truncate text-[12px] lg:text-sm text-gray-500 ${open ? 'invisible' : ''}`}>
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
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 lg:px-4 lg:pb-4 -mt-0.5">
          {data.rate && (
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-[12px] lg:text-sm text-gray-500">원/위안 환율</span>
              <span className="text-[15px] lg:text-base font-semibold text-gray-900">1위안 = {data.rate.krwPerCny.toFixed(2)}원</span>
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
                <span key={w.city} className="text-[12px] lg:text-xs bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 text-gray-700">
                  {w.city} {w.desc} {w.min}~{w.max}°
                </span>
              ))}
            </div>
          )}

          {data.lines.length > 0 && (
            <ul className="space-y-1">
              {data.lines.map((line, i) => (
                <li key={i} className="text-[13px] lg:text-sm text-gray-800 flex gap-1.5">
                  <span className="text-orange-500">•</span>{line}
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-gray-400 mt-2">{Number(month)}월 {Number(day)}일 · 매일 오전 8시(중국 시간) AI가 자동 작성합니다.</p>
        </div>
      )}
    </div>
  );
}
