import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const suggestedQuestions = [
  '중국 비자 신청은 어떻게 하나요?',
  '거류증 갱신 절차가 궁금해요',
  '중국에서 병원 가는 방법 알려주세요',
  '상하이/베이징 날씨는 어떤가요?',
];

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  const handleSuggestedQuestion = (q: string) => {
    setChatInput(q);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiLoading) return;

    const userMessage = chatInput;
    setChatInput('');

    const newHistory: ChatMessage[] = [
      ...chatMessages,
      { role: 'user', content: userMessage, timestamp: Date.now() }
    ];
    setChatMessages(newHistory);
    setIsAiLoading(true);

    try {
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer dc2213720f4b4a88ae06ddbd434ab1dd.qDGcLtBM9gGqp6ff`
        },
        body: JSON.stringify({
          model: 'glm-z1-flash',
          messages: [
            {
              role: 'system',
              content: '당신은 중국에 거주하는 한국인(재중 한인)을 위한 생활 도우미 AI입니다. 비자, 거류증, 생활정보, 병원, 부동산, 교육, 교통 등 중국 생활 전반에 대해 한국어로 친절하고 정확하게 답변해주세요. 답변은 간결하고 실용적으로 해주세요.'
            },
            ...newHistory.map(msg => ({ role: msg.role, content: msg.content }))
          ],
          max_tokens: 800,
          temperature: 0.7,
        })
      });

      const data = await response.json();

      if (data.choices && data.choices[0]) {
        const reply = data.choices[0].message.content;
        setChatMessages(prev => [
          ...prev,
          { role: 'assistant', content: reply, timestamp: Date.now() }
        ]);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      console.error('GLAM AI error:', err);
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: "죄송해요, 일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요. 😢", timestamp: Date.now() }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

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
          z-index: 60;
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
          z-index: 61;
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
      <button
        onClick={() => setIsOpen(true)}
        className="ai-fab fixed bottom-6 right-6 z-50"
        aria-label="AI에게 물어보세요"
        title="AI에게 물어보세요"
      >
        <span className="ai-fab-eyes">
          <span></span>
          <span></span>
        </span>
      </button>

      {/* AI 패널 (슬라이드인) */}
      {isOpen && (
        <>
          <div className="ai-panel-overlay" onClick={() => setIsOpen(false)} />
          <div className="ai-panel">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <span className="ai-fab" style={{ width: 36, height: 36 }}>
                  <span className="ai-fab-eyes">
                    <span style={{ width: 3, height: 3 }}></span>
                    <span style={{ width: 3, height: 3 }}></span>
                  </span>
                </span>
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
                <div className="bg-gray-50 rounded-2xl px-4">
                  {suggestedQuestions.map((q, idx) => (
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
                    const cleanContent = msg.content.replace(/[\s\S]*?<\/think>/gi, '').trim();
                    return (
                      <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={msg.role === 'user' ? 'user-avatar' : 'ai-avatar'}>
                          {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                          {msg.role === 'assistant'
                            ? cleanContent.split('\n').map((line, i) => (
                                <span key={i}>
                                  {line}
                                  {i < cleanContent.split('\n').length - 1 && <br />}
                                </span>
                              ))
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
