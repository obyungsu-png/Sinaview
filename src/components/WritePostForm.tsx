import { useState } from 'react';
import { BOARD_CATEGORIES, BoardCategory, Post } from '../data/chinaLifePosts';
import { CITY_ROOMS } from '../config/communityLinks';
import { createPost } from '../utils/community';

interface WritePostFormProps {
  author: { author: string; authorKey: string };
  defaultCategory?: string;
  defaultCity?: string;
  onDone: (post: Post) => void;
  onCancel: () => void;
}

const field: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none',
};
const label: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' };

/** 게시판 글쓰기 - 분류(필수)·지역(선택)·제목·내용 */
export function WritePostForm({ author, defaultCategory, defaultCity, onDone, onCancel }: WritePostFormProps) {
  const [category, setCategory] = useState<BoardCategory | ''>(
    (BOARD_CATEGORIES as readonly string[]).includes(defaultCategory || '') ? defaultCategory as BoardCategory : ''
  );
  const [city, setCity] = useState(defaultCity && defaultCity !== '전체' ? defaultCity : '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!category) return setError('분류를 선택해 주세요.');
    if (!title.trim()) return setError('제목을 입력해 주세요.');
    if (!content.trim()) return setError('내용을 입력해 주세요.');
    setSaving(true);
    setError('');
    try {
      const post = await createPost({ title: title.trim(), content: content.trim(), category, city: city || undefined, ...author });
      onDone(post);
    } catch (e: any) {
      setError(e.message || '저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '19px', fontWeight: 600, marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #667eea' }}>글쓰기</h2>

      <div style={{ marginBottom: '14px' }}>
        <span style={label}>분류 <span style={{ color: '#e53e3e' }}>*</span></span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {BOARD_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              style={{
                padding: '6px 12px', borderRadius: '999px', fontSize: '13px', cursor: 'pointer',
                border: category === cat ? '1px solid #667eea' : '1px solid #ddd',
                background: category === cat ? '#667eea' : 'white',
                color: category === cat ? 'white' : '#555',
              }}
            >{cat}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={label} htmlFor="post-city">지역 (선택)</label>
        <select id="post-city" value={city} onChange={e => setCity(e.target.value)} style={{ ...field, background: 'white' }}>
          <option value="">지역 없음</option>
          {CITY_ROOMS.map(room => <option key={room.name} value={room.name}>{room.name}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={label} htmlFor="post-title">제목</label>
        <input id="post-title" value={title} maxLength={100} onChange={e => setTitle(e.target.value)} placeholder="제목을 입력하세요" style={field} />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={label} htmlFor="post-content">내용</label>
        <textarea
          id="post-content"
          value={content}
          maxLength={5000}
          onChange={e => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={12}
          style={{ ...field, resize: 'vertical', lineHeight: 1.6 }}
        />
        <div style={{ textAlign: 'right', fontSize: '11px', color: '#999' }}>{content.length}/5000</div>
      </div>

      {error && <p style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button type="button" onClick={onCancel} disabled={saving}
          style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '14px' }}>
          취소
        </button>
        <button type="button" onClick={submit} disabled={saving} className="btn-write-blue" style={{ opacity: saving ? 0.6 : 1 }}>
          {saving ? '등록 중…' : '등록'}
        </button>
      </div>
    </div>
  );
}
