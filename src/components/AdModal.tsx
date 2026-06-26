import { useState } from 'react';
import { X, ExternalLink, Play, Image as ImageIcon, FileText } from 'lucide-react';

export interface AdContent {
  id: string;
  title: string;
  description?: string;
  company?: string;
  // 미디어 (나중에 채울 수 있게)
  imageUrl?: string;
  videoUrl?: string;
  bodyText?: string;
  link?: string;
  linkLabel?: string;
  wechat?: string;
  phone?: string;
}

interface AdModalProps {
  ad: AdContent;
  onClose: () => void;
}

export function AdModal({ ad, onClose }: AdModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{ad.company || '광고'}</p>
            <h2 className="text-base font-semibold text-gray-900 leading-snug">{ad.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-3 shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* 이미지 */}
          {ad.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full rounded-xl object-cover max-h-56"
            />
          ) : (
            <div className="w-full h-36 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2">
              <ImageIcon className="w-8 h-8 text-gray-300" />
              <p className="text-xs text-gray-400">이미지를 등록하세요</p>
            </div>
          )}

          {/* 동영상 */}
          {ad.videoUrl ? (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <iframe
                src={ad.videoUrl}
                className="w-full aspect-video"
                allowFullScreen
                title={ad.title}
              />
            </div>
          ) : (
            <div className="w-full rounded-xl bg-gray-50 border border-dashed border-gray-200 p-4 flex items-center gap-3">
              <Play className="w-6 h-6 text-gray-300" />
              <p className="text-xs text-gray-400">동영상 URL을 등록하면 여기에 재생됩니다</p>
            </div>
          )}

          {/* 본문 */}
          {ad.description && (
            <p className="text-sm text-gray-700 leading-relaxed">{ad.description}</p>
          )}
          {ad.bodyText && (
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-4">
              {ad.bodyText}
            </div>
          )}

          {/* 빈 본문 안내 */}
          {!ad.description && !ad.bodyText && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FileText className="w-4 h-4" />
              <span>본문 내용을 등록하세요</span>
            </div>
          )}

          {/* 연락처 */}
          {(ad.phone || ad.wechat) && (
            <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
              {ad.phone && <p>📞 {ad.phone}</p>}
              {ad.wechat && <p>💬 WeChat: {ad.wechat}</p>}
            </div>
          )}

          {/* 링크 버튼 */}
          {ad.link && ad.link !== '#' && (
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {ad.linkLabel || '자세히 보기'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
