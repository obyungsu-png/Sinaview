import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CityRoom, NAVER_CAFE_URL } from '../config/communityLinks';

const btn: React.CSSProperties = {
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
  padding: '10px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
  border: 'none', cursor: 'pointer', textDecoration: 'none', color: 'white',
};
const WECHAT_GREEN = '#07c160';
const NAVER_GREEN = '#03c75a';

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '100%',
          maxWidth: '320px', textAlign: 'center' }}
      >
        {children}
        <button
          onClick={onClose}
          style={{ marginTop: '16px', width: '100%', padding: '8px', border: '1px solid #ddd',
            borderRadius: '6px', background: '#f8f9fa', cursor: 'pointer', fontSize: '13px' }}
        >닫기</button>
      </div>
    </div>
  );
}

/** 도시를 고르면 게시판 위에 뜨는 "우리 동네 방" 카드 */
export function CityRoomCard({ room }: { room: CityRoom }) {
  const [showQr, setShowQr] = useState(false);
  const naverLink = room.naverBoard || NAVER_CAFE_URL;

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 16px',
      marginBottom: '16px', background: '#fafafa' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>
        📍 {room.name} 교민방
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          style={{ ...btn, background: WECHAT_GREEN }}
          onClick={() => room.wechatQr ? setShowQr(true) : alert('위챗방 QR 준비 중입니다.')}
        >💬 위챗방 입장</button>
        {naverLink ? (
          <a href={naverLink} target="_blank" rel="noopener noreferrer"
            style={{ ...btn, background: NAVER_GREEN }}>N 카페 게시판</a>
        ) : (
          <button style={{ ...btn, background: '#bbb', cursor: 'default' }} disabled>N 카페 준비 중</button>
        )}
      </div>
      {showQr && (
        <Modal onClose={() => setShowQr(false)}>
          <div style={{ fontWeight: 700, marginBottom: '12px' }}>{room.name} 위챗방</div>
          <img src={room.wechatQr} alt={`${room.name} 위챗방 QR`} style={{ width: '220px', height: '220px', objectFit: 'contain' }} />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            위챗 → 스캔(扫一扫)으로 QR을 찍어 주세요
          </div>
        </Modal>
      )}
    </div>
  );
}

/** 게시글 하단 공유 버튼: 위챗(QR) / 네이버 카페 / 링크 복사 */
export function ShareButtons({ title }: { title: string }) {
  const [showQr, setShowQr] = useState(false);
  const url = window.location.href;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n${url}`);
      alert('링크를 복사했습니다. 위챗방이나 카페에 붙여넣기 하세요.');
    } catch {
      prompt('아래 링크를 복사하세요', url);
    }
  };

  const naverShare = `https://share.naver.com/web/shareView?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', margin: '16px 0', flexWrap: 'wrap' }}>
        <button style={{ ...btn, background: WECHAT_GREEN }} onClick={() => setShowQr(true)}>💬 위챗 공유</button>
        <a href={naverShare} target="_blank" rel="noopener noreferrer" style={{ ...btn, background: NAVER_GREEN }}>N 카페 공유</a>
        <button style={{ ...btn, background: '#6b7280' }} onClick={copyLink}>🔗 링크 복사</button>
      </div>
      {showQr && (
        <Modal onClose={() => setShowQr(false)}>
          <div style={{ fontWeight: 700, marginBottom: '12px' }}>위챗으로 공유</div>
          <QRCodeSVG value={url} size={200} />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', lineHeight: 1.5 }}>
            위챗 스캔(扫一扫)으로 열고<br />오른쪽 위 ··· → 친구/단톡방에 보내기
          </div>
        </Modal>
      )}
    </>
  );
}
