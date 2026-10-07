import { useEffect, useState } from 'react';
import { Pin, PinOff, Pencil, Trash2, RefreshCw, Lock, LogOut, Save, X } from 'lucide-react@0.487.0';
import { serverFetch } from '../utils/supabase/client';

/*
 * CSM > AI 콘텐츠 관리
 * - 증권·중국소식·비자 공지 AI 기사 수정·삭제·고정
 * - 증권 개장 브리핑, 아침 브리핑 문구 수정
 * 모든 변경은 서버가 운영자 비밀번호(ADMIN_PASSWORD)로 확인한다.
 */

type SectionId = 'market' | 'china' | 'visa';

interface AiArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  source: string;
  url: string;
  publishedAt: string;
  pinned?: boolean;
  editedAt?: string;
}

interface AdminData {
  sections: Record<SectionId, AiArticle[]>;
  limits: Record<SectionId, number>;
  marketBriefing: { text: string; at: string | null };
  morning: { date: string; lines: string[] } | null;
}

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'market', label: '증권 기사' },
  { id: 'china', label: '중국소식' },
  { id: 'visa', label: '비자 공지' },
];

const PASSWORD_KEY = 'sinaview-admin-password';
const hasHanzi = (text = '') => /[぀-ヿ一-鿿]/.test(text);

function readSaved() {
  try { return sessionStorage.getItem(PASSWORD_KEY) || ''; } catch { return ''; }
}

function formatDate(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// 서버 오류 메시지만 뽑기 ("Server request failed: 401 - {...}")
function errorText(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  const json = msg.match(/\{.*\}$/s)?.[0];
  try { return json ? JSON.parse(json).error || msg : msg; } catch { return msg; }
}

export function AiContentManager() {
  const [password, setPassword] = useState(readSaved);
  const [input, setInput] = useState('');
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [section, setSection] = useState<SectionId>('market');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<AiArticle | null>(null);
  const [marketText, setMarketText] = useState('');
  const [morningText, setMorningText] = useState('');
  const [notice, setNotice] = useState('');

  const call = (path: string, options: RequestInit = {}, pw = password) =>
    serverFetch(path, { ...options, headers: { 'x-admin-password': pw } });

  const load = async (pw = password) => {
    setLoading(true);
    setError('');
    try {
      const res: AdminData = await call('/admin/ai-content', {}, pw);
      setData(res);
      setMarketText(res.marketBriefing.text);
      setMorningText((res.morning?.lines || []).join('\n'));
      setPassword(pw);
      try { sessionStorage.setItem(PASSWORD_KEY, pw); } catch { /* 저장 못 해도 계속 */ }
    } catch (e) {
      const msg = errorText(e);
      setError(msg);
      if (/비밀번호|401/.test(msg)) logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (password) load(password); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = () => {
    setPassword('');
    setData(null);
    try { sessionStorage.removeItem(PASSWORD_KEY); } catch { /* 무시 */ }
  };

  const flash = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice(''), 2500);
  };

  const run = async (action: () => Promise<unknown>, done: string) => {
    setError('');
    try {
      await action();
      flash(done);
      await load();
    } catch (e) {
      setError(errorText(e));
    }
  };

  const togglePin = (item: AiArticle) => run(
    () => call(`/admin/ai-content/${section}/${encodeURIComponent(item.id)}`, { method: 'PUT', body: JSON.stringify({ pinned: !item.pinned }) }),
    item.pinned ? '고정을 풀었습니다.' : '고정했습니다. 개수가 넘어도 지워지지 않습니다.',
  );

  const remove = (item: AiArticle) => {
    if (!confirm(`"${item.title}" 기사를 삭제할까요?\n삭제하면 되돌릴 수 없고, 같은 원문으로 다시 쓰지 않습니다.`)) return;
    run(() => call(`/admin/ai-content/${section}/${encodeURIComponent(item.id)}`, { method: 'DELETE' }), '삭제했습니다.');
  };

  const saveEdit = () => {
    if (!editing) return;
    const { id, title, summary, content, category } = editing;
    run(
      () => call(`/admin/ai-content/${section}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ title, summary, content, category }) })
        .then(() => setEditing(null)),
      '저장했습니다.',
    );
  };

  if (!password || !data) {
    return (
      <div className="bg-white rounded-lg border p-6 max-w-md">
        <h3 className="font-semibold flex items-center gap-2 mb-1"><Lock className="w-4 h-4" /> 운영자 확인</h3>
        <p className="text-sm text-gray-500 mb-4">AI 콘텐츠를 고치려면 운영자 비밀번호(Supabase Secrets의 ADMIN_PASSWORD)를 넣어 주세요.</p>
        <form
          onSubmit={e => { e.preventDefault(); if (input) load(input); }}
          className="flex gap-2"
        >
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="운영자 비밀번호"
            className="flex-1 border rounded-md px-3 py-2 text-sm"
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading || !input} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50">
            {loading ? '확인 중…' : '확인'}
          </button>
        </form>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>
    );
  }

  const items = data.sections[section].filter(i =>
    !query || [i.title, i.summary, i.content].some(t => t?.includes(query)));
  const pinnedCount = data.sections[section].filter(i => i.pinned).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-gray-500">
          AI가 자동으로 쓴 글을 고치거나 지울 수 있습니다. 고친 내용은 바로 사이트에 반영됩니다.
        </p>
        <div className="flex gap-2">
          <button onClick={() => load()} className="flex items-center gap-1 px-3 py-1.5 border rounded-md text-sm bg-white hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 새로고침
          </button>
          <button onClick={logout} className="flex items-center gap-1 px-3 py-1.5 border rounded-md text-sm bg-white hover:bg-gray-50">
            <LogOut className="w-4 h-4" /> 잠그기
          </button>
        </div>
      </div>

      {notice && <div className="text-sm bg-green-50 text-green-700 border border-green-200 rounded-md px-3 py-2">{notice}</div>}
      {error && <div className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">{error}</div>}

      {/* 브리핑 문구 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold">증권 개장 브리핑</h3>
          <p className="text-xs text-gray-500 mb-2">마지막 작성 {formatDate(data.marketBriefing.at) || '없음'} · 평일 09:30에 AI가 새로 씁니다.</p>
          <textarea value={marketText} onChange={e => setMarketText(e.target.value)} rows={6} className="w-full border rounded-md p-2 text-sm" />
          <button
            onClick={() => run(() => call('/admin/briefing/market', { method: 'PUT', body: JSON.stringify({ text: marketText }) }), '증권 브리핑을 저장했습니다.')}
            className="mt-2 flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm"
          >
            <Save className="w-4 h-4" /> 저장
          </button>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold">아침 브리핑 - 오늘의 소식</h3>
          <p className="text-xs text-gray-500 mb-2">
            {data.morning ? `${data.morning.date} · ` : ''}한 줄에 소식 하나씩. 환율·날씨는 자동이며, 매일 08:00에 새로 써집니다.
          </p>
          <textarea
            value={morningText}
            onChange={e => setMorningText(e.target.value)}
            rows={6}
            disabled={!data.morning}
            placeholder={data.morning ? '' : '아직 아침 브리핑이 없습니다.'}
            className="w-full border rounded-md p-2 text-sm disabled:bg-gray-50"
          />
          <button
            disabled={!data.morning}
            onClick={() => run(
              () => call('/admin/briefing/morning', { method: 'PUT', body: JSON.stringify({ lines: morningText.split('\n') }) }),
              '아침 브리핑을 저장했습니다.',
            )}
            className="mt-2 flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> 저장
          </button>
        </div>
      </div>

      {/* 기사 목록 */}
      <div className="bg-white rounded-lg border">
        <div className="flex items-center gap-2 p-3 border-b flex-wrap">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => { setSection(s.id); setEditing(null); }}
              className={`px-3 py-1.5 rounded-full text-sm ${section === s.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {s.label} ({data.sections[s.id].length})
            </button>
          ))}
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="제목·본문 검색"
            className="ml-auto border rounded-md px-3 py-1.5 text-sm w-full sm:w-56"
          />
        </div>
        <p className="text-xs text-gray-500 px-3 pt-2">
          최근 {data.limits[section]}건까지 보관하고, 넘으면 오래된 것부터 지워집니다. 📌 고정한 기사({pinnedCount}건)는 지워지지 않습니다.
        </p>

        <ul className="divide-y">
          {items.length === 0 && <li className="p-6 text-center text-sm text-gray-400">기사가 없습니다.</li>}
          {items.map(item => (
            <li key={item.id} className="p-3">
              {editing?.id === item.id ? (
                <div className="space-y-2">
                  <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full border rounded-md px-2 py-1.5 text-sm font-semibold" placeholder="제목" />
                  <input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} className="w-40 border rounded-md px-2 py-1.5 text-sm" placeholder="분류" />
                  <textarea value={editing.summary} onChange={e => setEditing({ ...editing, summary: e.target.value })} rows={2} className="w-full border rounded-md p-2 text-sm" placeholder="요약" />
                  <textarea value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} rows={12} className="w-full border rounded-md p-2 text-sm" placeholder="본문 (문단 사이는 빈 줄)" />
                  {[editing.title, editing.summary, editing.content].some(hasHanzi) && (
                    <p className="text-xs text-orange-600">한자·일본어가 들어 있으면 사이트에 표시되지 않습니다.</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm"><Save className="w-4 h-4" /> 저장</button>
                    <button onClick={() => setEditing(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-md border text-sm"><X className="w-4 h-4" /> 취소</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.pinned && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">📌 고정</span>}
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{item.category}</span>
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.summary}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {item.source} · {formatDate(item.publishedAt)}{item.editedAt ? ` · 수정 ${formatDate(item.editedAt)}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => togglePin(item)} title={item.pinned ? '고정 풀기' : '고정'} className="p-1.5 rounded hover:bg-gray-100">
                      {item.pinned ? <PinOff className="w-4 h-4 text-amber-600" /> : <Pin className="w-4 h-4 text-gray-500" />}
                    </button>
                    <button onClick={() => setEditing({ ...item })} title="수정" className="p-1.5 rounded hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={() => remove(item)} title="삭제" className="p-1.5 rounded hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
