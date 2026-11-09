import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { X, Sparkles, Send, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { serverUrl } from '../utils/supabase/client';
import { getAiContext, onAiAsk, onAiContextChange, type AiContext } from '../utils/aiAssistant';
import AiTutorRobot, { useDraggableFab } from './AiTutorRobot.single';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  prompt?: string; // 화면에는 content(짧은 질문)를 보이고, AI 에게는 prompt(문제 전체)를 보냄
  timestamp: number;
}

const suggestedQuestions = [
  '중국 비자 신청은 어떻게 하나요?',
  '거류증 갱신 절차가 궁금해요',
  '중국에서 병원 가는 방법 알려주세요',
  '상하이/베이징 날씨는 어떤가요?',
];

// 페이지별 기본 질문 (운전면허는 전용 화면이 있어 기본값 유지)
const pageSuggestedQuestions: Record<string, string[]> = {
  visadocument: [
    '거류증 연장은 어떻게 신청하나요?',
    '비자 종류(Z·X·F)는 어떻게 다른가요?',
    '대사관 공증·인증 절차를 알려주세요',
    '출입국 관리국 예약은 어떻게 하나요?',
  ],
  education: [
    '중국 국제학교 입학 조건이 궁금해요',
    '학비와 등록금은 대략 얼마인가요?',
    '중국 대학 진학 준비는 어떻게 하나요?',
    '어학원과 과외는 어떻게 선택하나요?',
  ],
  yellowpages: [
    '한인 업체를 어떻게 찾나요?',
    '업체 등록은 어떻게 하나요?',
    '병원·식당 추천을 받고 싶어요',
    '한국어 가능한 업체만 보고 싶어요',
  ],
  auto: [
    '중국에서 차량 구매 절차를 알려주세요',
    '차량 보험은 어떻게 가입하나요?',
    '중국 운전면허 전환 방법이 궁금해요',
    '차량 등록·번호판 발급은 어떻게 하나요?',
  ],
  news: [
    '최신 중국 생활 관련 소식을 알려주세요',
    '환율·물가 동향이 궁금해요',
    '비자·출입국 정책 변경이 있나요?',
    '중국 날씨와 미세먼지 정보를 알려주세요',
  ],
  usedmarket: [
    '중고 거래 시 사기 예방법이 궁금해요',
    '중고 물품 가격은 어떻게 정하나요?',
    '거래 수수료·결제 방법을 알려주세요',
    '안전하게 직거래하는 방법이 궁금해요',
  ],
  securities: [
    '중국 증권 계좌는 어떻게 개설하나요?',
    'A주 투자 시 주의점은 무엇인가요?',
    '위안화 환전·송금 방법을 알려주세요',
    '증권 거래 수수료는 얼마인가요?',
  ],
  realestate: [
    '중국에서 집 구하는 방법이 궁금해요',
    '임대 계약 시 확인할 사항은 무엇인가요?',
    '보증금·중개 수수료는 어떻게 되나요?',
    '집 계약 갱신·퇴거 절차를 알려주세요',
  ],
  chinalife: [
    '게시판에 글은 어떻게 작성하나요?',
    '인기 글과 최신 글을 보고 싶어요',
    '카테고리는 어떻게 나뉘나요?',
    '궁금한 점을 게시판에 물어보려면?',
  ],
  lsm: [
    '학습센터는 어떤 서비스를 제공하나요?',
    '과정 신청 방법을 알려주세요',
    '수업 비용과 일정이 궁금해요',
    '상담은 어떻게 받을 수 있나요?',
  ],
  csm: [
    'CSM은 무슨 서비스인가요?',
    'CSM 이용 방법을 알려주세요',
    '비용과 혜택이 궁금해요',
    '상담·문의는 어떻게 하나요?',
  ],
  blog: [
    '최신 블로그 글을 보고 싶어요',
    '주제별 글은 어떻게 찾나요?',
    '구독·알림 설정 방법이 궁금해요',
    '글 작성은 어떻게 하나요?',
  ],
  hsk: [
    'HSK 시험 일정이 궁금해요',
    'HSK 등급별 수준을 알려주세요',
    'HSK 신청 방법과 비용은?',
    'HSK 준비는 어떻게 해야 하나요?',
  ],
};

// 인라인 마크다운(**bold**, *italic*, `code`)을 JSX로 변환
function renderInline(text: string): (string | ReactElement)[] {
  const parts: (string | ReactElement)[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={key++} className="font-bold text-gray-900">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++} className="italic">{match[3]}</em>);
    } else if (match[4]) {
      parts.push(<code key={key++} className="bg-gray-200 px-1 py-0.5 rounded text-[13px] font-mono">{match[4]}</code>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

// 마크다운 텍스트를 JSX 요소로 렌더링
function renderMarkdown(content: string): ReactElement {
  const lines = content.split('\n');
  const elements: ReactElement[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = (key: number) => {
    if (listItems.length === 0 || !listType) return;
    const Tag = listType;
    elements.push(
      <Tag key={`list-${key}`} className={`pl-5 my-1.5 space-y-0.5 ${listType === 'ul' ? 'list-disc' : 'list-decimal'}`}>
        {listItems.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (/^#{3}\s/.test(trimmed)) {
      flushList(idx);
      elements.push(<h4 key={idx} className="font-bold text-[13px] text-gray-800 mt-2 mb-0.5">{renderInline(trimmed.replace(/^#{3}\s/, ''))}</h4>);
    } else if (/^#{2}\s/.test(trimmed)) {
      flushList(idx);
      elements.push(<h3 key={idx} className="font-bold text-sm text-gray-800 mt-2 mb-0.5">{renderInline(trimmed.replace(/^#{2}\s/, ''))}</h3>);
    } else if (/^#\s/.test(trimmed)) {
      flushList(idx);
      elements.push(<h2 key={idx} className="font-bold text-base text-gray-800 mt-2 mb-0.5">{renderInline(trimmed.replace(/^#\s/, ''))}</h2>);
    } else if (/^[-*]\s/.test(trimmed)) {
      if (listType !== 'ul') { flushList(idx); listType = 'ul'; }
      listItems.push(trimmed.replace(/^[-*]\s/, ''));
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (listType !== 'ol') { flushList(idx); listType = 'ol'; }
      listItems.push(trimmed.replace(/^\d+\.\s/, ''));
    } else if (trimmed === '') {
      flushList(idx);
      elements.push(<div key={idx} className="h-1.5" />);
    } else {
      flushList(idx);
      elements.push(<p key={idx} className="my-0.5">{renderInline(trimmed)}</p>);
    }
  });
  flushList(lines.length);

  return <>{elements}</>;
}

export function AiAssistantWidget({ hideFab = false, page = 'main' }: { hideFab?: boolean; page?: string } = {}) {
  const fab = useDraggableFab<HTMLDivElement>();
  const questions = pageSuggestedQuestions[page] ?? suggestedQuestions;
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [context, setContext] = useState<AiContext | null>(getAiContext);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = chatMessages;
  const loadingRef = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  // 지금 보고 있는 화면(예: 운전면허 문제)을 알고 있으면 바로 물어볼 수 있게
  useEffect(() => onAiContextChange(() => setContext(getAiContext())), []);
  useEffect(
    () =>
      onAiAsk(({ label, prompt }) => {
        setIsOpen(true);
        void sendMessage(label, prompt);
      }),
    [],
  );

  const handleSuggestedQuestion = (q: string) => {
    setChatInput(q);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput;
    if (await sendMessage(userMessage)) setChatInput('');
  };

  const sendMessage = async (userMessage: string, prompt?: string) => {
    if (loadingRef.current) return false;
    loadingRef.current = true;

    const newHistory: ChatMessage[] = [
      ...messagesRef.current,
      { role: 'user', content: userMessage, prompt, timestamp: Date.now() }
    ];
    setChatMessages(newHistory);
    setIsAiLoading(true);

    try {
      const historyForRequest = newHistory.slice(0, -1).slice(-10).map(msg => ({ role: msg.role, content: msg.prompt ?? msg.content }));
      const response = await fetch(`${serverUrl}/api/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt ?? userMessage,
          history: historyForRequest,
        })
      });

      const data = await response.json();

      if (data.success && data.reply) {
        setChatMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.reply, timestamp: Date.now() }
        ]);
      } else {
        throw new Error(data.error || 'Invalid response');
      }
    } catch (err) {
      console.error('GLM AI error:', err);
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: "죄송해요, 일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요. 😢", timestamp: Date.now() }
      ]);
    } finally {
      setIsAiLoading(false);
      loadingRef.current = false;
    }
    return true;
  };

  // 화면이 따로 준 버튼(예: 단어 공부해요)이 있으면 AI 질문 대신 그 버튼 — 누르면 AI 창을 닫고 그 화면을 연다
  const runContext = () => {
    if (!context) return;
    if (context.action) {
      setIsOpen(false);
      context.action.run();
    } else void sendMessage(context.label, context.prompt);
  };
  const contextButton = context && (
    <button
      onClick={runContext}
      disabled={isAiLoading && !context.action}
      className="w-full text-left rounded-2xl border border-[#bfe2fa] bg-[#eef7fe] px-4 py-3 hover:bg-[#e2f1fd] disabled:opacity-60 transition-colors"
    >
      <span className="block text-xs text-[#2a8bc9] mb-0.5">지금 보는 화면 · {context.title}</span>
      <span className="block text-sm font-medium text-gray-800">{context.action ? context.action.label : `💡 ${context.label}`}</span>
    </button>
  );

  return (
    <>
      <style>{`
        .ai-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          flex-shrink: 0;
        }
        .chat-bubble {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
        }
        .chat-bubble.user {
          background-color: #667eea;
          color: white;
          border-bottom-right-radius: 2px;
        }
        .chat-bubble.ai {
          background-color: #f3f4f6;
          color: #1f2937;
          border-bottom-left-radius: 2px;
        }
        .ai-fab {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #cfe0ff 0%, #a9c6ff 35%, #8fd6ee 70%, #bfe9ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(102, 126, 234, 0.35);
          border: none;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .ai-fab:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 10px 24px rgba(102, 126, 234, 0.45);
        }
        .ai-fab-eyes {
          display: flex;
          gap: 6px;
        }
        .ai-fab-eyes span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #2d2d3a;
          display: block;
        }
        .ai-panel-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.35);
          z-index: 1001;
          animation: aiFadeIn 0.2s ease;
        }
        .ai-panel {
          position: fixed;
          top: 0;
          right: 0;
          height: 100%;
          width: 420px;
          max-width: 100vw;
          background: #fff;
          z-index: 1002;
          box-shadow: -8px 0 30px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          animation: aiSlideIn 0.25s ease;
        }
        /* 데스크톱: 중앙 모달창 */
        @media (min-width: 1024px) {
          .ai-panel {
            top: 50%;
            left: 50%;
            right: auto;
            transform: translate(-50%, -50%);
            height: 640px;
            max-height: 85vh;
            width: 460px;
            max-width: 90vw;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.25);
            animation: aiModalIn 0.25s ease;
          }
        }
        @keyframes aiSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes aiModalIn {
          from { transform: translate(-50%, -45%) scale(0.95); opacity: 0; }
          to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes aiFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .ai-panel-suggestion {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 4px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          font-size: 14px;
          color: #374151;
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          width: 100%;
          text-align: left;
          transition: color 0.15s ease;
        }
        .ai-panel-suggestion:hover {
          color: #667eea;
        }
      `}</style>

      {/* AI 도움 버튼 (이모티콘) */}
      {!hideFab && (
        <div
          ref={fab.boxRef}
          style={fab.style}
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 touch-none"
        >
          <button
            {...fab.handlers}
            onClick={() => {
              if (fab.consumeDrag()) return;
              setIsOpen(true);
            }}
            className={`aibot-btn ${fab.dragging ? 'aibot-dragging' : ''}`}
            aria-label="AI에게 물어보세요"
            title="AI에게 물어보세요"
          >
            <AiTutorRobot size={62} />
          </button>
        </div>
      )}

      {/* AI 패널 (슬라이드인) */}
      {isOpen && (
        <>
          <div className="ai-panel-overlay" onClick={() => setIsOpen(false)} />
          <div className="ai-panel">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <AiTutorRobot size={36} still />
                <span className="font-bold text-gray-800">AI에게 물어보세요</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {chatMessages.length === 0 ? (
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <p className="text-2xl font-bold text-gray-800 mb-1">hi~</p>
                <p className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-1">
                  중국 생활 도우미예요 <Sparkles className="w-5 h-5 text-yellow-400" />
                </p>
                <p className="text-sm text-gray-500 mt-2 mb-6">
                  비자, 거류증, 병원, 부동산 등 무엇이든 편하게 물어보세요
                </p>
                {contextButton && <div className="mb-4">{contextButton}</div>}
                <div className="bg-gray-50 rounded-2xl px-4">
                  {questions.map((q, idx) => (
                    <button
                      key={idx}
                      className="ai-panel-suggestion"
                      onClick={() => handleSuggestedQuestion(q)}
                    >
                      <span>{q}</span>
                      <span className="text-gray-300">›</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50/50">
                <div className="flex flex-col space-y-4">
                  {chatMessages.map((msg, idx) => {
                    const cleanContent = msg.content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                    return (
                      <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={msg.role === 'user' ? 'user-avatar' : 'ai-avatar'}>
                          {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                          {msg.role === 'assistant'
                            ? renderMarkdown(cleanContent)
                            : cleanContent
                          }
                        </div>
                      </div>
                    );
                  })}
                  {isAiLoading && (
                    <div className="flex gap-2 flex-row">
                      <div className="ai-avatar animate-pulse">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="chat-bubble ai flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}

            <div className="p-3 border-t bg-white shrink-0">
              {context && chatMessages.length > 0 && (
                <button
                  onClick={runContext}
                  disabled={isAiLoading && !context.action}
                  className="mb-2 max-w-full truncate px-3 py-1.5 rounded-full border border-[#bfe2fa] bg-[#eef7fe] text-xs text-[#2a8bc9] disabled:opacity-60"
                >
                  {context.action ? context.action.label : `💡 ${context.label}`}
                </button>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="말씀해 주세요..."
                  className="flex-1 text-sm bg-gray-50 focus:bg-white transition-colors"
                  disabled={isAiLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
                  disabled={!chatInput.trim() || isAiLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
