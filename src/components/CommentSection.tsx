import { useState, useEffect, useRef } from 'react';
import { Heart, Trash2, MessageCircle, X, Sparkles, Send, Bot, User } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Reply {
  id: string;
  author: string;
  userId: string;
  username?: string;
  content: string;
  date: string;
  likes: number;
}

interface Comment {
  id: string;
  author: string;
  userId: string;
  username?: string;
  content: string;
  date: string;
  likes: number;
  replies?: Reply[];
}

interface CommentSectionProps {
  pageType: string; // 'market', 'community', 'driver-license' 등
  itemId: string | number;
  currentUser?: { id: string; name: string; username?: string } | null;
  isAdmin?: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function CommentSection({ pageType, itemId, currentUser, isAdmin }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  // AI Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-c6687586`;

  // 댓글 불러오기
  useEffect(() => {
    fetchComments();
  }, [pageType, itemId]);

  // AI 채팅 스크롤 — 새 메시지 오면 항상 맨 아래로
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatMessages, isAiLoading]);

  const fetchComments = async () => {
    try {
      // Try to fetch from server first
      const response = await fetch(`${API_BASE}/comments/${pageType}/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Server unavailable');
      }
      
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (err) {
      // Fallback to localStorage if server is unavailable
      console.log('서버 연결 실패, 로컬 스토리지 사용:', err);
      const localKey = `comments:${pageType}:${itemId}`;
      const localComments = localStorage.getItem(localKey);
      if (localComments) {
        setComments(JSON.parse(localComments));
      }
    }
  };

  // 댓글 작성 (등록회원만)
  const handleAddComment = async () => {
    if (!currentUser) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!newComment.trim()) {
      setError('댓글 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    const newCommentObj = {
      id: Date.now().toString(),
      author: currentUser.name,
      userId: currentUser.id,
      username: currentUser.username,
      content: newComment,
      date: new Date().toISOString(),
      likes: 0,
      replies: [],
      createdAt: Date.now()
    };

    try {
      const response = await fetch(`${API_BASE}/comments/${pageType}/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          content: newComment,
          author: currentUser.name,
          userId: currentUser.id,
          username: currentUser.username
        })
      });

      if (!response.ok) {
        throw new Error('Server unavailable');
      }

      const data = await response.json();
      
      if (data.success) {
        setComments([...comments, data.comment]);
        setNewComment('');
      } else {
        setError(data.error || '댓글 작성에 실패했습니다.');
      }
    } catch (err) {
      // Fallback to localStorage
      console.log('서버 연결 실패, 로컬 스토리지 사용');
      const updatedComments = [...comments, newCommentObj];
      setComments(updatedComments);
      const localKey = `comments:${pageType}:${itemId}`;
      localStorage.setItem(localKey, JSON.stringify(updatedComments));
      setNewComment('');
    } finally {
      setLoading(false);
    }
  };

  // 대댓글 작성
  const handleAddReply = async (commentId: string) => {
    if (!currentUser) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!replyContent.trim()) {
      setError('댓글 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/comments/${pageType}/${itemId}/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          content: replyContent,
          author: currentUser.name,
          userId: currentUser.id,
          username: currentUser.username
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // 댓글 목록 업데이트
        setComments(comments.map(c => 
          c.id === commentId 
            ? { ...c, replies: [...(c.replies || []), data.reply] }
            : c
        ));
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setError(data.error || '답글 작성에 실패했습니다.');
      }
    } catch (err) {
      setError('답글 작성 중 오류가 발생했습니다.');
      console.error('답글 작성 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // AI 채팅 메시지 전송
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

  // 댓글 삭제 (작성자 본인 또는 관리자)
  const handleDeleteComment = async (commentId: string, authorUserId: string) => {
    // 본인 또는 관리자만 삭제 가능
    const canDelete = currentUser?.id === authorUserId || isAdmin;
    
    if (!canDelete) {
      alert('본인이 작성한 댓글만 삭제할 수 있습니다.');
      return;
    }

    if (!confirm('정말 이 댓글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${API_BASE}/comments/${pageType}/${itemId}/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setComments(comments.filter(c => c.id !== commentId));
      }
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
    }
  };

  // 대댓글 삭제 (작성자 본인 또는 관리자)
  const handleDeleteReply = async (commentId: string, replyId: string, authorUserId: string) => {
    const canDelete = currentUser?.id === authorUserId || isAdmin;
    
    if (!canDelete) {
      alert('본인이 작성한 댓글만 삭제할 수 있습니다.');
      return;
    }

    if (!confirm('정말 이 답글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${API_BASE}/comments/${pageType}/${itemId}/${commentId}/reply/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setComments(comments.map(c => 
          c.id === commentId 
            ? { ...c, replies: (c.replies || []).filter(r => r.id !== replyId) }
            : c
        ));
      }
    } catch (err) {
      console.error('답글 삭제 실패:', err);
    }
  };

  // 댓글 좋아요
  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`${API_BASE}/comments/${pageType}/${itemId}/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setComments(comments.map(c => 
          c.id === commentId ? { ...c, likes: c.likes + 1 } : c
        ));
      }
    } catch (err) {
      console.error('좋아요 실패:', err);
    }
  };

  // 대댓글 좋아요
  const handleLikeReply = async (commentId: string, replyId: string) => {
    try {
      const response = await fetch(`${API_BASE}/comments/${pageType}/${itemId}/${commentId}/reply/${replyId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setComments(comments.map(c => 
          c.id === commentId 
            ? {
                ...c,
                replies: (c.replies || []).map(r => 
                  r.id === replyId ? { ...r, likes: r.likes + 1 } : r
                )
              }
            : c
        ));
      }
    } catch (err) {
      console.error('좋아요 실패:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comments-section-container grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <style>{`
        .comment-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }
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
      `}</style>

      {/* 왼쪽: 댓글 영역 (2/3) */}
      <div className="comments-main lg:col-span-2">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[#667eea]">
          <h3 className="text-lg font-bold text-gray-800">댓글 <span className="text-[#667eea]">{comments.length}</span></h3>
        </div>

        {comments.length > 0 ? (
          <div className="space-y-6 mb-8">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="comment-avatar">
                      {comment.username ? comment.username[0].toUpperCase() : comment.author[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 text-[15px]">
                          {comment.username ? `@${comment.username}` : comment.author}
                        </span>
                        {currentUser?.id === comment.userId && (
                          <span className="bg-[#667eea] text-white text-[11px] px-1.5 py-0.5 rounded">작성자</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{formatDate(comment.date)}</div>
                    </div>
                  </div>
                  {(currentUser?.id === comment.userId || isAdmin) && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id, comment.userId)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs border border-gray-200 rounded px-2 py-1"
                    >
                      <Trash2 className="w-3 h-3" /> 삭제
                    </button>
                  )}
                </div>
                
                <div className="pl-[48px] text-[15px] text-gray-600 leading-relaxed mb-3 whitespace-pre-wrap">
                  {comment.content}
                </div>

                <div className="pl-[48px] flex gap-4">
                  <button 
                    onClick={() => handleLikeComment(comment.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#667eea] transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5" /> 좋아요 {comment.likes}
                  </button>
                  {currentUser && (
                    <button 
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#667eea] transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> 답글 {comment.replies?.length || 0}
                    </button>
                  )}
                </div>

                {/* 대댓글 목록 */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-[48px] pl-5 border-l-2 border-gray-100 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="comment-avatar" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                              {reply.username ? reply.username[0].toUpperCase() : reply.author[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-800 text-sm">
                                  {reply.username ? `@${reply.username}` : reply.author}
                                </span>
                                {currentUser?.id === reply.userId && (
                                  <span className="bg-[#667eea] text-white text-[10px] px-1 py-0.5 rounded">작성자</span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-400">{formatDate(reply.date)}</div>
                            </div>
                          </div>
                          {(currentUser?.id === reply.userId || isAdmin) && (
                            <button 
                              onClick={() => handleDeleteReply(comment.id, reply.id, reply.userId)}
                              className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-[11px] border border-gray-200 rounded px-1.5 py-0.5"
                            >
                              <Trash2 className="w-2.5 h-2.5" /> 삭제
                            </button>
                          )}
                        </div>
                        <div className="pl-10 text-sm text-gray-600 mb-2 whitespace-pre-wrap">
                          {reply.content}
                        </div>
                        <div className="pl-10">
                          <button 
                            onClick={() => handleLikeReply(comment.id, reply.id)}
                            className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-[#667eea] transition-colors"
                          >
                            <Heart className="w-3 h-3" /> 좋아요 {reply.likes}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 대댓글 입력창 */}
                {replyingTo === comment.id && currentUser && (
                  <div className="mt-4 ml-[48px] bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-600">답글 작성</span>
                      <button 
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                        className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-xs"
                      >
                        <X className="w-3 h-3" /> 취소
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        className="flex-1 p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#667eea] resize-none h-[60px]"
                        placeholder="답글을 입력하세요..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                      />
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        disabled={loading || !replyContent.trim()}
                        className="bg-[#667eea] text-white px-4 rounded text-sm font-medium hover:bg-[#5a6fd6] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? '등록...' : '등록'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-lg mb-8">
            첫 댓글을 남겨보세요! 💬
          </div>
        )}

        {/* 댓글 입력창 */}
        {!currentUser ? (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-lg p-5 text-center">
            <p className="text-[#667eea] font-medium text-sm">🐰 댓글을 작성하고 싶으신가요? 먼저 회원가입을 해주세요~ 💕</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-100 rounded-xl p-5 focus-within:border-[#667eea] transition-colors shadow-sm">
            <div className="text-sm font-bold text-gray-700 mb-3">댓글 작성</div>
            {error && <div className="bg-red-50 text-red-600 text-xs p-2 rounded mb-3">{error}</div>}
            <div className="flex gap-3">
              <textarea
                className="flex-1 p-3 border border-gray-200 rounded-lg text-[15px] focus:outline-none resize-none h-[80px]"
                placeholder="댓글을 입력하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                onClick={handleAddComment}
                disabled={loading || !newComment.trim()}
                className="bg-[#667eea] text-white px-6 rounded-lg text-sm font-bold hover:bg-[#5a6fd6] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? '등록 중...' : '등록'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 오른쪽: AI 채팅 위젯 (1/3) */}
      <div className="ai-chat-widget lg:col-span-2">
        <Card className="h-full max-h-[600px] flex flex-col border-2 border-teal-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-4 px-5 rounded-t-lg shrink-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-yellow-200" />
              AI에게 물어보세요
            </CardTitle>
            <p className="text-xs text-teal-100 opacity-90 font-normal mt-1">
              중국 생활 전반에 대해 한국어로 답변해드립니다.
            </p>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col" style={{height: '480px'}}>
            {/* 메시지 영역 — 고정 높이, 내부 스크롤 */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 min-h-0">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-3">
                  <Bot className="w-12 h-12 text-teal-200" />
                  <p className="text-sm">
                    "중국 비자 신청은 어떻게 하나요?"<br/>
                    "상하이 날씨 어때요?"<br/>
                    무엇이든 물어보세요!
                  </p>
                </div>
              ) : (
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
              )}
            </div>
            
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
                  placeholder="AI에게 질문하기..."
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}