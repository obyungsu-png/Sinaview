import { Car, ChevronRight } from 'lucide-react';

/** 운전면허 연습 바로가기 — 자동차 탭·자동차 게시판 맨 위에 둠 */
export function DriverLicenseBanner({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#eefaf3] text-left active:bg-[#e2f5ea] hover:bg-[#e2f5ea] transition-colors"
    >
      <span className="shrink-0 w-10 h-10 rounded-full bg-[#03c75a] text-white flex items-center justify-center">
        <Car className="w-5 h-5" strokeWidth={2} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[16.5px] font-bold text-gray-900 leading-snug">중국 운전면허 연습</span>
        <span className="block text-[13.5px] text-gray-600 leading-snug">필기시험 · 만점 교육 · 학법 감점</span>
      </span>
      <ChevronRight className="shrink-0 w-5 h-5 text-gray-400" />
    </button>
  );
}
