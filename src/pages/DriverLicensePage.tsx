import { ArrowLeft } from 'lucide-react@0.487.0';
import { Button } from '../components/ui/button';
import { useState } from 'react';
import { DriverLicenseCommunity } from '../components/DriverLicenseCommunity';

interface DriverLicensePageProps {
  onBack: () => void;
}

// 순서 연습 문제 풀이 컴포넌트
function SequentialPracticePage({ onBack }: { onBack: () => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [autoNext, setAutoNext] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  const totalQuestions = 100;
  const accuracyRate = totalQuestions > 0 
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100) || 0 
    : 0;

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // 이미 답을 선택했으면 무시
    
    setSelectedAnswer(answerIndex);
    setAnsweredQuestions(prev => new Set([...prev, currentQuestion]));
    
    // 정답은 A (0번 인덱스)라고 가정
    const isCorrect = answerIndex === 0;
    
    // 정답/오답 사운드 재생
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (isCorrect) {
      // 정답 사운드: 딩동댕 (즐거운 소리 - 3개의 상승하는 음)
      const playDingDongDang = () => {
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (즐거운 화음)
        notes.forEach((freq, i) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = freq;
          oscillator.type = 'sine';
          
          const startTime = audioContext.currentTime + (i * 0.15);
          gainNode.gain.setValueAtTime(0.3, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + 0.3);
        });
      };
      playDingDongDang();
    } else {
      // 오답 사운드: 삐 (높은 단일 경고음)
      const playBeep = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // 높은 주파수 (경고음)
        oscillator.type = 'sine'; // 깔끔한 톤
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      };
      playBeep();
    }
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      if (autoNext) {
        setTimeout(() => handleNextQuestion(), 1500);
      }
    } else {
      setWrongCount(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsFavorite(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsFavorite(false);
    }
  };

  const handleQuestionJump = (questionNum: number) => {
    setCurrentQuestion(questionNum);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsFavorite(false);
  };

  return (
    <div className="max-w-[1000px] mx-auto px-5 py-12">
      <style>{`
        :root {
          --primary-blue: #37a7f0;
          --text-dark: #333;
          --text-gray: #666;
          --text-light-gray: #999;
          --border-color: #e0e0e0;
          --correct-green: #2ecc71;
          --wrong-red: #e74c3c;
        }

        .breadcrumb {
          font-size: 14px;
          color: var(--text-light-gray);
          margin-bottom: 40px;
        }
        .breadcrumb span {
          margin: 0 5px;
        }
        .breadcrumb strong {
          color: var(--text-dark);
          font-weight: bold;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .question-text {
          font-size: 22px;
          line-height: 1.5;
          width: 90%;
        }

        .fav-btn {
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          padding: 3px 10px;
          border-radius: 4px;
          cursor: pointer;
          color: var(--text-gray);
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }
        .fav-btn:hover {
          background-color: #eee;
        }
        .fav-btn.active {
          background-color: #fff3cd;
          border-color: #ffc107;
          color: #856404;
        }

        .options-list {
          margin-bottom: 40px;
        }

        .option-item {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          font-size: 18px;
          cursor: pointer;
          padding: 15px;
          border: 2px solid #f0f0f0;
          border-radius: 8px;
          background-color: white;
          transition: all 0.2s;
        }
        .option-item:hover {
          background-color: #f9f9f9;
        }
        .option-item.selected-correct {
          background-color: white;
          border-color: var(--correct-green);
          border-width: 2px;
        }
        .option-item.selected-wrong {
          background-color: white;
          border-color: var(--wrong-red);
          border-width: 2px;
        }

        .option-radio {
          display: none;
        }

        .option-checkmark {
          width: 24px;
          height: 24px;
          margin-right: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .option-checkmark svg {
          width: 24px;
          height: 24px;
        }

        .question-type-hint {
          font-size: 14px;
          color: var(--text-light-gray);
          margin-bottom: 20px;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 20px;
        }

        .control-bar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          padding-bottom: 40px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 40px;
        }

        .nav-btn {
          background-color: var(--primary-blue);
          color: white;
          border: none;
          padding: 10px 25px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .nav-btn:hover {
          background-color: #2a8bc9;
        }
        .nav-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .stats-area {
          display: flex;
          align-items: center;
          gap: 20px;
          font-size: 14px;
          color: var(--text-gray);
          margin-left: 10px;
        }

        .auto-next-label {
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          color: var(--text-dark);
          font-weight: 500;
        }

        .stat-item span.green { color: var(--correct-green); font-weight: bold; }
        .stat-item span.red { color: var(--wrong-red); font-weight: bold; }

        .right-tools {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .tool-btn {
          background-color: white;
          border: 1px solid #ddd;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          color: var(--text-dark);
          transition: all 0.2s;
        }
        .tool-btn:hover {
          border-color: var(--primary-blue);
          color: var(--primary-blue);
        }
        .tool-btn.active {
          background-color: var(--primary-blue);
          color: white;
          border-color: var(--primary-blue);
        }

        .sync-link {
          font-size: 14px;
          color: var(--primary-blue);
          text-decoration: none;
          margin-left: 10px;
        }
        .sync-link:hover { text-decoration: underline; }

        .ad-section h3 {
          font-size: 20px;
          font-weight: normal;
          margin-bottom: 20px;
          color: var(--text-dark);
        }
        
        .school-item {
          display: flex;
          align-items: center;
          gap: 20px;
          color: var(--text-gray);
          font-size: 14px;
        }
        .stars {
          color: #ffc107;
        }
        .price {
          color: #ffa502;
          font-weight: 500;
        }

        .explanation-box {
          margin-top: 20px;
          padding: 20px;
          background-color: #e3f2fd;
          border-left: 4px solid var(--primary-blue);
          border-radius: 4px;
        }
        .explanation-box h4 {
          font-size: 16px;
          margin-bottom: 10px;
          color: var(--text-dark);
        }
        .explanation-box p {
          font-size: 15px;
          color: var(--text-gray);
          line-height: 1.6;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          color: var(--text-gray);
          margin-bottom: 20px;
          transition: all 0.2s;
        }
        .back-btn:hover {
          border-color: var(--primary-blue);
          color: var(--primary-blue);
        }

        .answer-sheet-section {
          margin-top: 40px;
          padding: 30px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }

        .answer-sheet-header {
          font-size: 18px;
          margin-bottom: 20px;
          color: var(--text-dark);
          font-weight: 500;
        }

        .answer-grid {
          display: grid;
          grid-template-columns: repeat(20, 1fr);
          gap: 8px;
          max-width: 100%;
        }

        .answer-cell {
          aspect-ratio: 1;
          border: 1px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 4px;
          font-size: 13px;
          background-color: white;
          transition: all 0.2s;
          color: var(--text-gray);
        }
        .answer-cell:hover {
          border-color: var(--primary-blue);
          background-color: #f0f7ff;
        }
        .answer-cell.current {
          background-color: var(--primary-blue);
          color: white;
          border-color: var(--primary-blue);
          font-weight: bold;
        }
        .answer-cell.answered {
          background-color: #e8f5e9;
          border-color: var(--correct-green);
        }
      `}</style>

      {/* 뒤로가기 버튼 */}
      <button onClick={onBack} className="back-btn">
        <i className="fa-solid fa-arrow-left"></i>
        필기시험으로 돌아가기
      </button>

      {/* 1. Breadcrumb */}
      <div className="breadcrumb">
        현재위치: 홈 <span>&gt;</span> 모의고사 <span>&gt;</span> 소형차 필기(과목1) <span>&gt;</span> <strong>순서 연습</strong>
      </div>

      {/* 2. 문제 */}
      <div className="question-header">
        <h1 className="question-text">
          {currentQuestion}/{totalQuestions}. 차량이 내리막길을 주행할 때, 적절하게 속도를 제어하고 엔진 브레이크를 충분히 활용하여 제동해야 한다.
        </h1>
        <button 
          className={`fav-btn ${isFavorite ? 'active' : ''}`}
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-star`}></i> 즐겨찾기
        </button>
      </div>

      {/* 3. 보기 */}
      <div className="options-list">
        <div 
          className={`option-item ${
            selectedAnswer === 0 
              ? 'selected-correct' 
              : ''
          }`}
          onClick={() => handleAnswerSelect(0)}
        >
          <div className="option-checkmark">
            {selectedAnswer === 0 && (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="11" fill="#37a7f0" stroke="#37a7f0" strokeWidth="2"/>
                <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span>A. 맞음</span>
        </div>
        <div 
          className={`option-item ${
            selectedAnswer === 1 
              ? 'selected-wrong' 
              : ''
          }`}
          onClick={() => handleAnswerSelect(1)}
        >
          <div className="option-checkmark">
            {selectedAnswer === 1 && (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="11" fill="#37a7f0" stroke="#37a7f0" strokeWidth="2"/>
                <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span>B. 틀림</span>
        </div>
      </div>

      {/* 해설 표시 */}
      {showExplanation && (
        <div className="explanation-box">
          <h4>
            <i className="fa-solid fa-lightbulb"></i> 정답 해설
          </h4>
          <p>
            내리막길에서는 속도가 빨라지기 쉬우므로 적절하게 속도를 제어해야 합니다. 
            엔진 브레이크를 충분히 활용하면 브레이크 과열을 방지하고 안전하게 주행할 수 있습니다. 
            따라서 이 문장은 <strong>맞음</strong>입니다.
          </p>
        </div>
      )}

      {/* 4. 유형 힌트 */}
      <div className="question-type-hint">
        판단형 문제, 맞고 틀림을 판단하세요.
      </div>

      {/* 5. 컨트롤 바 */}
      <div className="control-bar">
        {/* 이전/다음 버튼 */}
        <button 
          className="nav-btn"
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 1}
        >
          이전 문제
        </button>
        <button 
          className="nav-btn"
          onClick={handleNextQuestion}
          disabled={currentQuestion === totalQuestions}
        >
          다음 문제
        </button>

        {/* 통계 및 옵션 */}
        <div className="stats-area">
          <label className="auto-next-label">
            <input 
              type="checkbox" 
              checked={autoNext}
              onChange={(e) => setAutoNext(e.target.checked)}
            /> 정답 시 자동 넘김
          </label>
          <div className="stat-item">정답: <span className="green">{correctCount}</span>문제</div>
          <div className="stat-item">오답: <span className="red">{wrongCount}</span>문제</div>
          <div className="stat-item">정답률: {accuracyRate}%</div>
        </div>

        {/* 우측 도구 */}
        <div className="right-tools">
          <button 
            className={`tool-btn ${showExplanation ? 'active' : ''}`}
            onClick={() => setShowExplanation(!showExplanation)}
          >
            해설 보기
          </button>
          <button 
            className={`tool-btn ${showAnswerSheet ? 'active' : ''}`}
            onClick={() => setShowAnswerSheet(!showAnswerSheet)}
          >
            답안지 보기
          </button>
          <a href="#" className="sync-link">학습 진도 동기화</a>
        </div>
      </div>

      {/* 답안지 섹션 */}
      {showAnswerSheet && (
        <div className="answer-sheet-section">
          <div className="answer-sheet-header">답안지 보기</div>
          <div className="answer-grid">
            {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
              <div
                key={num}
                className={`answer-cell ${
                  num === currentQuestion ? 'current' : ''
                } ${answeredQuestions.has(num) ? 'answered' : ''}`}
                onClick={() => handleQuestionJump(num)}
              >
                {num}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. 하단 광고 영역 */}
      <div className="ad-section">
        <h3>아직 운전학원에 등록 안 하셨나요? 인기 학원 확인하기</h3>
        <div className="school-item">
          <span>•</span>
          <span>C1/C2 1종/2종 보통</span>
          <span className="stars">★★★★★</span>
          <span className="price">상담 문의</span>
        </div>
      </div>
    </div>
  );
}

// 주제별 연습 페이지 컴포넌트
function ChapterPracticePage({ onBack, selectedCity }: { onBack: () => void; selectedCity: string }) {
  const chapters = [
    { number: 1, title: '운전면허 및 자동차 관리 규정', questionCount: 294 },
    { number: 2, title: '도로 통행 조건 및 통행 규정', questionCount: 1005 },
    { number: 3, title: '도로교통 안전 위법 행위 및 처벌', questionCount: 94 },
    { number: 4, title: '도로 교통사고 처리 관련 규정', questionCount: 54 },
    { number: 5, title: '자동차 기초 지식', questionCount: 151 },
    { number: 6, title: '과목1 베이징 지역 문제', questionCount: 81 }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4">
      <style>{`
        .chapter-container {
          font-family: 'Noto Sans KR', sans-serif;
          background-color: #fff;
          color: #333;
          line-height: 1.6;
        }

        .chapter-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .chapter-header h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
          color: #2c3e50;
        }

        .chapter-header p {
          font-size: 14px;
          color: #888;
        }

        .chapter-list {
          border-top: 1px solid #eee;
        }

        .chapter-item {
          padding: 25px 0;
          border-bottom: 1px solid #eee;
        }

        .chapter-title {
          font-size: 18px;
          font-weight: 500;
          color: #333;
          margin-bottom: 15px;
        }

        .question-count {
          color: #888;
          font-size: 16px;
          margin-left: 5px;
          font-weight: normal;
        }

        .action-links {
          display: flex;
          gap: 40px;
          padding-left: 10px;
        }

        .action-link {
          font-size: 14px;
          color: #666;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: color 0.2s;
        }

        .action-link::before {
          content: '•';
          color: #bbb;
          margin-right: 8px;
          font-size: 18px;
          line-height: 1;
        }

        .action-link:hover {
          color: #37a7f0;
        }
        .action-link:hover::before {
          color: #37a7f0;
        }

        .back-btn-chapter {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          color: #666;
          margin-bottom: 30px;
          transition: all 0.2s;
        }
        .back-btn-chapter:hover {
          border-color: #37a7f0;
          color: #37a7f0;
        }

        @media (max-width: 600px) {
          .chapter-title { font-size: 16px; }
          .action-links { gap: 20px; }
        }
      `}</style>

      <div className="chapter-container">
        {/* 뒤로가기 버튼 */}
        <button onClick={onBack} className="back-btn-chapter">
          <i className="fa-solid fa-arrow-left"></i>
          필기시험으로 돌아가기
        </button>

        {/* 헤더 */}
        <header className="chapter-header">
          <h1>{selectedCity} 소형차 필기시험(과목1) 주제별 연습</h1>
          <p>법규 챕터에 따라 단계별로 분류</p>
        </header>

        {/* 챕터 리스트 */}
        <div className="chapter-list">
          {chapters.map((chapter) => (
            <div key={chapter.number} className="chapter-item">
              <div className="chapter-title">
                제{chapter.number}장 {chapter.title} <span className="question-count">({chapter.questionCount}문제)</span>
              </div>
              <div className="action-links">
                <a href="#" className="action-link">순서대로 풀기</a>
                <a href="#" className="action-link">랜덤으로 풀기</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 난점 공략 페이지 컴포넌트
function DifficultPointsPage({ onBack }: { onBack: () => void }) {
  const difficultCategories = [
    { 
      id: 1, 
      title: '교통 표지판 완벽 정리', 
      icon: 'fa-solid fa-signs-post',
      color: '#e74c3c',
      questionCount: 120,
      accuracy: 65,
      description: '헷갈리기 쉬운 교통 표지판을 집중 학습하세요'
    },
    { 
      id: 2, 
      title: '벌점 제도 총정리', 
      icon: 'fa-solid fa-ban',
      color: '#e67e22',
      questionCount: 85,
      accuracy: 72,
      description: '위반 행위별 벌점과 처벌 규정을 마스터하세요'
    },
    { 
      id: 3, 
      title: '안전 거리 및 속도 제한', 
      icon: 'fa-solid fa-gauge-high',
      color: '#f39c12',
      questionCount: 95,
      accuracy: 68,
      description: '도로별 속도 제한과 안전 거리 계산법'
    },
    { 
      id: 4, 
      title: '교차로 통행 규칙', 
      icon: 'fa-solid fa-traffic-light',
      color: '#3498db',
      questionCount: 110,
      accuracy: 61,
      description: '신호등과 교차로에서의 올바른 통행 방법'
    },
    { 
      id: 5, 
      title: '특수 상황 대처법', 
      icon: 'fa-solid fa-cloud-showers-heavy',
      color: '#9b59b6',
      questionCount: 78,
      accuracy: 58,
      description: '악천후, 고장, 사고 시 대처 요령'
    },
    { 
      id: 6, 
      title: '주차 및 정차 규정', 
      icon: 'fa-solid fa-square-parking',
      color: '#1abc9c',
      questionCount: 92,
      accuracy: 70,
      description: '주차 금지 구역과 정차 규정 완벽 정리'
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4">
      <style>{`
        .difficult-container {
          font-family: 'Noto Sans KR', sans-serif;
          background-color: #fff;
        }

        .difficult-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .difficult-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #2c3e50;
        }

        .difficult-header p {
          font-size: 15px;
          color: #7f8c8d;
          line-height: 1.6;
        }

        .difficult-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }

        .difficult-card {
          background: white;
          border: 2px solid #ecf0f1;
          border-radius: 12px;
          padding: 28px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .difficult-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: var(--card-color);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .difficult-card:hover::before {
          transform: scaleX(1);
        }

        .difficult-card:hover {
          transform: translateY(-8px);
          border-color: var(--card-color);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
        }

        .difficult-card-icon {
          font-size: 48px;
          margin-bottom: 20px;
          color: var(--card-color);
        }

        .difficult-card-title {
          font-size: 20px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .difficult-card-desc {
          font-size: 14px;
          color: #7f8c8d;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .difficult-card-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #ecf0f1;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #95a5a6;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #2c3e50;
        }

        .accuracy-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          background: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
        }

        .accuracy-badge.medium {
          background: rgba(243, 156, 18, 0.1);
          color: #f39c12;
        }

        .accuracy-badge.high {
          background: rgba(46, 204, 113, 0.1);
          color: #2ecc71;
        }

        .info-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px 30px;
          border-radius: 12px;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .info-banner-icon {
          font-size: 40px;
          opacity: 0.9;
        }

        .info-banner-content h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .info-banner-content p {
          font-size: 14px;
          opacity: 0.95;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .difficult-grid {
            grid-template-columns: 1fr;
          }
          
          .info-banner {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>

      <div className="difficult-container">
        {/* 뒤로가기 버튼 */}
        <button onClick={onBack} className="back-btn-chapter">
          <i className="fa-solid fa-arrow-left"></i>
          필기시험으로 돌아가기
        </button>

        {/* 헤더 */}
        <header className="difficult-header">
          <h1>🎯 난점 공략 - 어려운 주제 집중 학습</h1>
          <p>
            많은 학습자들이 어려워하는 주제를 선별하여 집중적으로 연습할 수 있습니다.<br/>
            각 카테고리별로 오답률이 높은 문제들을 모아두었습니다.
          </p>
        </header>

        {/* 안내 배너 */}
        <div className="info-banner">
          <i className="fa-solid fa-lightbulb info-banner-icon"></i>
          <div className="info-banner-content">
            <h3>💡 학습 팁</h3>
            <p>정답률이 낮은 카테고리부터 시작하세요. 반복 학습을 통해 약점을 보완할 수 있습니다!</p>
          </div>
        </div>

        {/* 난점 카테고리 그리드 */}
        <div className="difficult-grid">
          {difficultCategories.map((category) => (
            <div 
              key={category.id} 
              className="difficult-card"
              style={{ '--card-color': category.color } as React.CSSProperties}
            >
              <i className={`${category.icon} difficult-card-icon`}></i>
              <h3 className="difficult-card-title">{category.title}</h3>
              <p className="difficult-card-desc">{category.description}</p>
              
              <div className="difficult-card-stats">
                <div className="stat-item">
                  <span className="stat-label">문제 수</span>
                  <span className="stat-value">{category.questionCount}개</span>
                </div>
                <div className="stat-item">
                  <span 
                    className={`accuracy-badge ${
                      category.accuracy >= 70 ? 'high' : 
                      category.accuracy >= 65 ? 'medium' : ''
                    }`}
                  >
                    평균 {category.accuracy}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 즐겨찾기 문항 풀이 컴포넌트
function FavoritesQuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // 샘플 즐겨찾기 문제들
  const favoriteQuestions = [
    {
      id: 1,
      question: '고속도로에서 안전거리를 유지하지 않은 경우 몇 점이 감점되나요?',
      options: ['2점', '3점', '6점', '12점'],
      correctAnswer: 1,
      explanation: '고속도로에서 안전거리를 유지하지 않으면 3점이 감점됩니다. 안전운전을 위해 충분한 차간 거리를 유지해야 합니다.'
    },
    {
      id: 2,
      question: '차량을 주차할 때 핸들을 어느 방향으로 돌려야 하나요?',
      options: ['왼쪽으로', '오른쪽으로', '중앙으로', '상관없다'],
      correctAnswer: 2,
      explanation: '주차 시 핸들을 중앙(정면)으로 두는 것이 안전합니다. 이렇게 하면 다음 출발 시 예상치 못한 방향으로 이동하는 것을 방지할 수 있습니다.'
    },
    {
      id: 3,
      question: '황색 실선은 무엇을 의미하나요?',
      options: ['차선 변경 가능', '차선 변경 금지', '일시정지', '서행'],
      correctAnswer: 1,
      explanation: '황색 실선은 차선 변경이 금지됨을 의미합니다. 황색 점선과 구별하여 기억해야 합니다.'
    }
  ];

  const currentQuestion = favoriteQuestions[currentQuestionIndex];

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < favoriteQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const removeFavorite = () => {
    alert('즐겨찾기에서 제거되었습니다.');
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <div className="py-4 text-sm text-gray-500 border-b mb-6">
        현재 위치: 홈 &gt; 즐겨찾기
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl">즐겨찾기 문제 풀이</h2>
        <div className="text-sm text-gray-600">
          총 {favoriteQuestions.length}문제 중 {currentQuestionIndex + 1}번째
        </div>
      </div>

      {/* 문제 카드 */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8 mb-6">
        {/* 문제 번호 및 즐겨찾기 제거 버튼 */}
        <div className="flex items-center justify-between mb-6">
          <span className="px-4 py-2 rounded-full text-white" style={{ backgroundColor: '#ff7675' }}>
            <i className="fa-solid fa-star mr-2"></i>
            문제 {currentQuestionIndex + 1}
          </span>
          <button 
            onClick={removeFavorite}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <i className="fa-solid fa-trash mr-1"></i>
            즐겨��기 제거
          </button>
        </div>

        {/* 문제 */}
        <div className="mb-8">
          <h3 className="text-xl mb-4">{currentQuestion.question}</h3>
        </div>

        {/* 선택지 */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => {
            let borderColor = 'border-gray-300';
            
            if (showExplanation) {
              if (index === currentQuestion.correctAnswer) {
                borderColor = 'border-green-500 border-[3px]';
              } else if (selectedAnswer === index && index !== currentQuestion.correctAnswer) {
                borderColor = 'border-red-500 border-[3px]';
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-lg border-2 bg-white hover:bg-gray-50 ${borderColor} transition-all ${!showExplanation ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
                {showExplanation && index === currentQuestion.correctAnswer && (
                  <i className="fa-solid fa-circle-check text-green-600 ml-2"></i>
                )}
                {showExplanation && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                  <i className="fa-solid fa-circle-xmark text-red-600 ml-2"></i>
                )}
              </button>
            );
          })}
        </div>

        {/* 해설 */}
        {showExplanation && (
          <div className="p-6 bg-blue-50 border-l-4 border-blue-500 rounded">
            <h4 className="font-medium mb-2 flex items-center">
              <i className="fa-solid fa-lightbulb text-blue-600 mr-2"></i>
              정답 해설
            </h4>
            <p className="text-gray-700">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-3 rounded-lg border-2 transition-all ${
            currentQuestionIndex === 0
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
          }`}
        >
          <i className="fa-solid fa-chevron-left mr-2"></i>
          이전 문제
        </button>

        <div className="flex gap-2">
          {favoriteQuestions.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentQuestionIndex(index);
                setSelectedAnswer(null);
                setShowExplanation(false);
              }}
              className={`w-10 h-10 rounded-full transition-all ${
                index === currentQuestionIndex
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              style={index === currentQuestionIndex ? { backgroundColor: '#37a7f0' } : {}}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === favoriteQuestions.length - 1}
          className={`px-6 py-3 rounded-lg border-2 transition-all ${
            currentQuestionIndex === favoriteQuestions.length - 1
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
          }`}
        >
          다음 문제
          <i className="fa-solid fa-chevron-right ml-2"></i>
        </button>
      </div>

      {/* 하단 안내 */}
      <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <i className="fa-solid fa-circle-info text-2xl text-yellow-600 mt-1"></i>
          <div>
            <h4 className="font-medium mb-2">즐겨찾기 문제 학습 팁</h4>
            <p className="text-sm text-gray-700">
              자주 틀리거나 중요한 문제들을 즐겨찾기에 저장하여 반복 학습하면 합격 확률이 높아집니다. 
              모든 즐겨찾기 문제를 완벽히 이해할 때까지 반복해서 풀어보세요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DriverLicensePage({ onBack }: DriverLicensePageProps) {
  const [selectedCity, setSelectedCity] = useState('대련');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'practice' | 'lecture' | 'faq' | 'favorites' | 'sequential' | 'chapter' | 'community'>('home');
  
  const cities = [
    '베이징', '상하이', '칭다오', '대련', '텐진', 
    '선양', '옌타이', '광저우', '심천', '우한', '웨이하이'
  ];

  return (
    <div className="min-h-screen bg-white pb-20" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* 헤더 영역 */}
      <header>
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center gap-3 text-2xl font-bold" style={{ color: '#37a7f0' }}>
              <i className="fa-solid fa-car-side text-4xl"></i>
              <span>운전면허 보감</span>
              <div className="relative ml-2">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-lg font-normal text-gray-600 hover:text-blue-600 hover:scale-105 transition-all duration-200 flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-50 hover:shadow-md"
                  style={{ 
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#37a7f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  ({selectedCity})
                  <i className={`fa-solid fa-chevron-down text-sm transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-2xl z-50 min-w-[140px] animate-fadeIn">
                    {cities.map((city) => (
                      <div
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setIsDropdownOpen(false);
                        }}
                        className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 cursor-pointer transition-all duration-200 hover:pl-6 hover:font-medium first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                        style={{
                          position: 'relative'
                        }}
                      >
                        {selectedCity === city && (
                          <i className="fa-solid fa-check text-blue-500 mr-2"></i>
                        )}
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
              <div className="flex border border-gray-300">
                <input 
                  type="text" 
                  placeholder="키워드를 입력하세요"
                  className="px-3 py-2 w-64 outline-none"
                />
                <button className="bg-gray-100 px-5 text-gray-700 hover:bg-gray-200 transition-colors">
                  검색
                </button>
              </div>
            </div>
          </div>
        </div>

        <nav style={{ backgroundColor: '#37a7f0', height: '50px', lineHeight: '50px' }}>
          <ul className="max-w-[1200px] mx-auto px-4 flex overflow-x-auto">
            <li 
              onClick={() => setCurrentView('home')}
              className={`px-6 text-white font-medium cursor-pointer transition-colors hover:bg-blue-600 ${currentView === 'home' ? 'bg-blue-600' : ''}`}
            >
              홈
            </li>
            <li 
              onClick={() => setCurrentView('practice')}
              className={`px-6 text-white font-medium cursor-pointer transition-colors hover:bg-blue-600 ${currentView === 'practice' ? 'bg-blue-600' : ''}`}
            >
              필기시험
            </li>
            <li 
              onClick={() => setCurrentView('lecture')}
              className={`px-6 text-white font-medium cursor-pointer transition-colors hover:bg-blue-600 ${currentView === 'lecture' ? 'bg-blue-600' : ''}`}
            >
              동영상 강의
            </li>
            <li 
              onClick={() => setCurrentView('faq')}
              className={`px-6 text-white font-medium cursor-pointer transition-colors hover:bg-blue-600 ${currentView === 'faq' ? 'bg-blue-600' : ''}`}
            >
              FAQ
            </li>
            <li 
              onClick={() => setCurrentView('community')}
              className={`px-6 text-white font-medium cursor-pointer transition-colors hover:bg-blue-600 ${currentView === 'community' ? 'bg-blue-600' : ''}`}
            >
              커뮤니티
            </li>
            <li className="px-6 text-white font-medium cursor-pointer transition-colors hover:bg-blue-600">
              틀린문제
            </li>
            <li 
              onClick={() => setCurrentView('favorites')}
              className={`px-6 text-white font-medium cursor-pointer transition-colors hover:bg-blue-600 ${currentView === 'favorites' ? 'bg-blue-600' : ''}`}
            >
              즐겨찾기
            </li>
            <li 
              onClick={() => setCurrentView('app123')}
              className={`px-6 text-white font-medium cursor-pointer transition-colors hover:bg-blue-600 ${currentView === 'app123' ? 'bg-blue-600' : ''}`}
            >
              123123 앱
            </li>
          </ul>
        </nav>
      </header>

      {/* 메인 컨텐츠 - 조건부 렌더링 */}
      {currentView === 'home' ? (
        // 홈 페이지 - 자동차 애니메이션
        <div style={{ flex: 1, position: 'relative', minHeight: 'calc(100vh - 200px)' }}>
          {/* Font Awesome CDN */}
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
          
          <style>{`
            .hero-wrapper-home {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              position: relative;
              min-height: calc(100vh - 200px);
            }

            .hero-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              max-width: 1400px;
              margin: 0 auto;
              padding: 0 5%;
              flex: 1;
              width: 100%;
              position: relative;
              z-index: 5;
              padding-bottom: 100px;
            }

            .hero-text { 
              flex: 0.8; 
              min-width: 400px; 
              z-index: 10; 
            }

            .hero-badge {
              background: white;
              color: #2980b9;
              padding: 8px 18px;
              font-size: 13px;
              font-weight: 800;
              display: inline-block;
              margin-bottom: 25px;
              border-radius: 20px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            }

            .hero-wrapper-home h1 {
              font-size: 56px;
              line-height: 1.2;
              font-weight: 900;
              margin-bottom: 25px;
              color: #1a1a1a;
            }

            .hero-highlight {
              position: relative;
              z-index: 1;
            }
            .hero-highlight::after {
              content: ''; 
              position: absolute; 
              bottom: 5px; 
              left: 0; 
              width: 100%; 
              height: 15px;
              background-color: #ffeaa7; 
              z-index: -1; 
              opacity: 1;
              transform: rotate(-2deg);
              border-radius: 4px;
            }

            .hero-description { 
              font-size: 18px; 
              line-height: 1.6; 
              margin-bottom: 40px; 
              color: #555; 
            }

            .hero-btn-group { 
              display: flex; 
              gap: 15px; 
              align-items: center; 
              margin-bottom: 40px; 
            }
            .hero-btn {
              padding: 16px 36px; 
              border-radius: 50px; 
              text-decoration: none; 
              font-weight: 800; 
              font-size: 16px;
              transition: all 0.3s ease; 
              box-shadow: 0 10px 20px rgba(0,0,0,0.1);
              cursor: pointer;
            }
            .hero-btn:hover { 
              transform: translateY(-3px); 
            }
            
            .hero-btn-primary { 
              background-color: #2c3e50; 
              color: white; 
            }
            .hero-btn-outline { 
              background-color: white; 
              color: #2c3e50; 
              border: 1px solid #eee; 
            }

            .hero-wechat-box {
              background: rgba(255,255,255,0.7);
              backdrop-filter: blur(10px);
              padding: 12px 25px; 
              border-radius: 50px;
              display: inline-flex; 
              align-items: center; 
              gap: 15px;
              box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            }
            .hero-wechat-icon { 
              font-size: 30px; 
              color: #2ecc71; 
            }
            .hero-wechat-info strong { 
              display: block; 
              font-size: 14px; 
              color: #555; 
            }
            .hero-wechat-info span { 
              font-size: 16px; 
              font-weight: bold; 
              color: #333; 
            }

            .hero-image {
              flex: 1.2;
              height: 100%;
              position: relative;
              min-height: 500px;
            }

            .balloon {
              position: absolute;
              border-radius: 50%;
              z-index: 5;
              animation: balloonFloat 5s ease-in-out infinite;
              box-shadow: inset -10px -10px 20px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.1);
            }
            .balloon::after {
              content: ''; 
              position: absolute; 
              bottom: -20px; 
              left: 50%; 
              width: 2px; 
              height: 30px;
              background: rgba(0,0,0,0.1); 
              transform: translateX(-50%);
            }

            .b1 { 
              width: 140px; 
              height: 140px; 
              background: radial-gradient(circle at 30% 30%, #ff9a9e, #ff6b6b); 
              top: 15%; 
              right: 20%; 
              animation-duration: 6s; 
            }
            .b2 { 
              width: 100px; 
              height: 100px; 
              background: radial-gradient(circle at 30% 30%, #a18cd1, #6a82fb); 
              top: 35%; 
              left: 15%; 
              animation-duration: 4.5s; 
            }
            .b3 { 
              width: 160px; 
              height: 160px; 
              background: radial-gradient(circle at 30% 30%, #fbc2eb, #a6c1ee); 
              bottom: 20%; 
              right: 10%; 
              animation-duration: 7s; 
            }
            .b4 { 
              width: 80px; 
              height: 80px; 
              background: radial-gradient(circle at 30% 30%, #fdcbf1, #e6dee9); 
              bottom: 40%; 
              left: 5%; 
              animation-duration: 5s; 
            }
            .b5 { 
              width: 60px; 
              height: 60px; 
              background: radial-gradient(circle at 30% 30%, #84fab0, #8fd3f4); 
              top: 10%; 
              left: 40%; 
              animation-duration: 3s; 
              opacity: 0.9; 
            }

            .road-track {
              position: absolute;
              bottom: 15px;
              left: 0;
              width: 100%;
              height: 2px;
              background-image: linear-gradient(to right, rgba(255,255,255,0.6) 50%, transparent 50%);
              background-size: 50px 100%;
              z-index: 1;
            }

            .car-wrapper {
              position: absolute;
              bottom: -20px;
              left: -200px;
              width: 180px;
              z-index: 20;
              animation: driveAcross 10s linear infinite;
            }

            .cute-car-img {
              width: 100%;
              filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1));
              animation: bounceCar 0.5s ease-in-out infinite alternate;
            }

            .wind {
              position: absolute;
              top: 50%;
              left: -30px;
              width: 40px;
              height: 3px;
              background: rgba(255,255,255,0.6);
              border-radius: 10px;
              animation: windBlow 0.5s linear infinite;
            }
            .wind:nth-child(2) { 
              top: 30%; 
              left: -20px; 
              width: 25px; 
              animation-delay: 0.2s; 
            }

            @keyframes balloonFloat {
              0% { transform: translateY(0); }
              50% { transform: translateY(-30px); }
              100% { transform: translateY(0); }
            }

            @keyframes driveAcross {
              0% { left: -250px; }
              100% { left: 100vw; }
            }

            @keyframes bounceCar {
              0% { transform: translateY(0); }
              100% { transform: translateY(-3px); }
            }

            @keyframes windBlow {
              0% { transform: translateX(0); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: translateX(-10px); opacity: 0; }
            }

            @media (max-width: 900px) {
              .hero-container { 
                flex-direction: column; 
                text-align: center; 
                margin-top: 40px; 
              }
              .hero-image { 
                height: 300px; 
                width: 100%; 
                margin-top: 20px; 
              }
              .hero-btn-group { 
                justify-content: center; 
              }
              .car-wrapper { 
                width: 140px; 
              }
            }
          `}</style>

          <div className="hero-wrapper-home" style={{ 
            background: 'white',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}>
            <div className="hero-container">
              {/* 텍스트 영역 */}
              <div className="hero-text">
                <span className="hero-badge">🎮 더 이상 지루한 공부는 그만!</span>
                <h1>
                  운전면허,<br/>
                  <span className="hero-highlight">게임처럼 쉽고</span><br/>
                  빠르게 따보세요!
                </h1>
                <p className="hero-description">
                  운전면허 보감과 함께라면 합격이 즐거워집니다.
                </p>

                <div className="hero-btn-group">
                  <a className="hero-btn hero-btn-primary">소프트웨어 다운로드</a>
                  <a className="hero-btn hero-btn-outline">위챗 미니 프로그램</a>
                </div>
              </div>

              {/* 우측 풍선만 둥둥 */}
              <div className="hero-image">
                <div className="balloon b1"></div>
                <div className="balloon b2"></div>
                <div className="balloon b3">
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    width: '100%',
                    padding: '0 10px'
                  }}>
                    <i className="fa-brands fa-weixin" style={{ 
                      fontSize: '32px', 
                      color: '#07C160',
                      display: 'block',
                      margin: '0 auto 6px',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}></i>
                    <div style={{ fontSize: '11px', marginBottom: '4px', opacity: 0.95 }}>공식 위챗 상담</div>
                    <div style={{ 
                      fontSize: '18px', 
                      color: '#000000',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      fontWeight: 900,
                      letterSpacing: '0.5px'
                    }}>matanboy</div>
                  </div>
                </div>
                <div className="balloon b4"></div>
                <div className="balloon b5"></div>
              </div>
            </div>

            {/* 하단 도로 및 지나가는 귀여운 자동차 */}
            <div className="road-track"></div>
            
            <div className="car-wrapper">
              <div className="wind"></div>
              <div className="wind"></div>
              <img src="https://cdn-icons-png.flaticon.com/512/3097/3097180.png" alt="Cute Yellow Car" className="cute-car-img"/>
            </div>
          </div>
        </div>
      ) : currentView === 'practice' ? (
        // 순서 연습 페이지 (기존 메인 콘텐츠)
        <div className="max-w-[1200px] mx-auto px-4">
          {/* 브레드크럼 */}
          <div className="py-4 text-sm text-gray-500">
            현재 위치: 홈 &gt; 모의고사 &gt; 필기시험 (과목1)
          </div>

          <div className="flex gap-8 mb-12 flex-wrap lg:flex-nowrap">
            {/* 왼쪽 메인 패널 */}
            <div className="flex-[3] min-w-0">
              {/* 소개 박스 */}
              <div className="bg-gray-50 border border-gray-200 p-8 text-center mb-5">
                <h2 className="text-2xl mb-4 text-gray-900">2025년 운전면허 필기시험 (과목1)</h2>
                <p className="text-sm text-gray-700 leading-relaxed text-left">
                  필기시험(과목1)은 운전면허 이론 시험으로, 운전자 이론 시험이라고도 합니다. 자동차 운전면허 신청 및 사용 규정에 따라 시험 내용은 운전 이론 기초, 도로 안전 법률 및 규정, 지방성 법규 등 관련 지식을 포함합니다. 시험 형식은 컴퓨터 시험이며, 100문제, 90점 이상 합격입니다.
                </p>
              </div>

              {/* 연습 메뉴 그리드 - 한 줄로 표시 */}
              <div className="grid grid-cols-3 gap-5 mb-8">
                <div 
                  onClick={() => setCurrentView('sequential')}
                  className="bg-gray-50 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-100 hover:-translate-y-1 transition-all rounded shadow-sm hover:shadow-md p-6"
                >
                  <i className="fa-solid fa-list-ol text-5xl mb-3" style={{ color: '#37a7f0' }}></i>
                  <span className="text-lg font-medium text-gray-700 mb-3">순서 연습</span>
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    과목별로 순차적으로 문제 풀이<br/>
                    체계적인 단계별 학습 가능
                  </p>
                </div>
                <div 
                  onClick={() => setCurrentView('chapter')}
                  className="bg-gray-50 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-100 hover:-translate-y-1 transition-all rounded shadow-sm hover:shadow-md p-6"
                >
                  <i className="fa-solid fa-book-open text-5xl mb-3" style={{ color: '#ff6b6b' }}></i>
                  <span className="text-lg font-medium text-gray-700 mb-3">주제별 연습</span>
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    교통법규를 단원별로 학습<br/>
                    특정 주제를 집중적으로 연습
                  </p>
                </div>
                <div 
                  onClick={() => setCurrentView('difficult')}
                  className="bg-gray-50 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-100 hover:-translate-y-1 transition-all rounded shadow-sm hover:shadow-md p-6"
                >
                  <i className="fa-solid fa-bullseye text-5xl mb-3" style={{ color: '#f39c12' }}></i>
                  <span className="text-lg font-medium text-gray-700 mb-3">난점 공략</span>
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    사용자의 오답률 높은 문제 집중 연습<br/>
                    약점 분석 및 보완 학습
                  </p>
                </div>
                <div className="bg-gray-50 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-100 hover:-translate-y-1 transition-all rounded shadow-sm hover:shadow-md p-6">
                  <i className="fa-solid fa-pen-to-square text-5xl mb-3" style={{ color: '#37a7f0' }}></i>
                  <span className="text-lg font-medium text-gray-700 mb-3">모의고사</span>
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    실제 시험 환경의 모의 테스트<br/>
                    2026년 최신 문제 반영
                  </p>
                </div>
              </div>

              {/* 통계 섹션 */}
              <div className="mt-10">
                <h3 className="text-xl mb-5 pb-3 border-b border-gray-200">운전면허 필기시험 연습 및 시험 통계</h3>
                
                <div className="flex items-center justify-between flex-wrap gap-8">
                  {/* 차트 영역 */}
                  <div className="flex items-center gap-8 flex-wrap">
                    <div className="w-24 h-24 rounded-full border-8 border-gray-200"></div>
                    <div className="text-sm text-gray-600 leading-loose">
                      <div className="flex items-center">
                        <i className="fa-solid fa-circle text-xs mr-2" style={{ color: '#37a7f0' }}></i>
                        <span>정답 *%</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fa-solid fa-circle text-xs mr-2" style={{ color: '#ff6b6b' }}></i>
                        <span>오답 *%</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fa-solid fa-circle text-xs mr-2" style={{ color: '#eee' }}></i>
                        <span>미풀이 *%</span>
                      </div>
                    </div>
                    <a href="#" className="text-sm underline ml-5 hover:text-blue-600" style={{ color: '#37a7f0' }}>
                      계속 풀기
                    </a>
                  </div>

                  {/* 하단 아이콘 버튼 */}
                  <div className="flex gap-10 flex-wrap">
                    <div className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                      <div className="w-16 h-16 rounded-full flex justify-center items-center text-white text-2xl mb-2 shadow-lg" style={{ backgroundColor: '#ff7675' }}>
                        <i className="fa-solid fa-star"></i>
                      </div>
                      <span className="text-sm">나의 즐겨찾기</span>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                      <div className="w-16 h-16 rounded-full flex justify-center items-center text-white text-2xl mb-2 shadow-lg" style={{ backgroundColor: '#37a7f0' }}>
                        <i className="fa-solid fa-clock-rotate-left"></i>
                      </div>
                      <span className="text-sm">시�� 기록</span>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                      <div className="w-16 h-16 rounded-full flex justify-center items-center text-white text-2xl mb-2 shadow-lg" style={{ backgroundColor: '#f1c40f' }}>
                        <i className="fa-solid fa-trophy"></i>
                      </div>
                      <span className="text-sm">랭킹</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 사이드바 */}
            <div className="flex-1 min-w-[280px]">
              {/* 동영상 강의 */}
              <div 
                onClick={() => setCurrentView('lecture')}
                className="flex items-center p-5 bg-gray-50 border border-gray-200 mb-8 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="text-5xl mr-4" style={{ color: '#37a7f0' }}>
                  <i className="fa-solid fa-circle-play"></i>
                </div>
                <div>
                  <h4 className="text-lg mb-1">동영상 강의</h4>
                  <p className="text-xs text-gray-500">운전면허 온라인 강의 수강</p>
                </div>
              </div>

              {/* 교통 표지판 리스트 */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-base text-gray-900">FAQ</span>
                <a href="#" className="text-xs text-gray-500 hover:text-blue-500">더보기</a>
              </div>

              <ul>
                <li className="flex items-center py-3 border-b border-dashed border-gray-200 cursor-pointer group">
                  <div className="w-8 h-8 rounded-full flex justify-center items-center text-white text-sm mr-3" style={{ backgroundColor: '#3498db' }}>
                    <i className="fa-solid fa-clipboard-list"></i>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-blue-500 transition-colors">필기 시험 절차</span>
                </li>
                <li className="flex items-center py-3 border-b border-dashed border-gray-200 cursor-pointer group">
                  <div className="w-8 h-8 rounded-full flex justify-center items-center text-white text-sm mr-3" style={{ backgroundColor: '#e67e22' }}>
                    <i className="fa-solid fa-building"></i>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-blue-500 transition-colors">지역 시험장 방문 접수</span>
                </li>
                <li className="flex items-center py-3 border-b border-dashed border-gray-200 cursor-pointer group">
                  <div className="w-8 h-8 rounded-full flex justify-center items-center text-white text-sm mr-3" style={{ backgroundColor: '#27ae60' }}>
                    <i className="fa-solid fa-heart-pulse"></i>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-blue-500 transition-colors">신체 검사</span>
                </li>
                <li className="flex items-center py-3 border-b border-dashed border-gray-200 cursor-pointer group">
                  <div className="w-8 h-8 rounded-full flex justify-center items-center text-white text-sm mr-3" style={{ backgroundColor: '#9b59b6' }}>
                    <i className="fa-solid fa-laptop"></i>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-blue-500 transition-colors">이론시험 응시</span>
                </li>
                <li className="flex items-center py-3 cursor-pointer group">
                  <div className="w-8 h-8 rounded-full flex justify-center items-center text-white text-sm mr-3" style={{ backgroundColor: '#e74c3c' }}>
                    <i className="fa-solid fa-id-card"></i>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-blue-500 transition-colors">면허증 발급</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : currentView === 'faq' ? (
        // FAQ 페이지
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="py-4 text-sm text-gray-500 border-b mb-6">
            현재 위치: 홈 &gt; FAQ
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl mb-2">자주 묻는 질문</h2>
            <p className="text-gray-600">운전면허 시험에 대해 자주 묻는 질문들을 확인하세요.</p>
          </div>

          {/* FAQ 아이템들 */}
          <div className="space-y-4">
            {[
              {
                question: '중국 운전면허 시험은 어떻게 진행되나요?',
                answer: '중국 운전면허 시험은 크게 4단계로 나뉩니다. 과목1(이론시험), 과목2(장내기능시험), 과목3(도로주행시험), 과목4(안전문명운전 이론시험)으로 구성되어 있습니다. 각 과목을 순차적으로 통과해야 면허증을 발급받을 수 있습니다.',
                icon: 'fa-clipboard-question',
                color: '#3498db'
              },
              {
                question: '필기시험(과목1) 합격 기준은 무엇인가요?',
                answer: '필기시험은 총 100문제가 출제되며, 90점 이상을 획득해야 합격입니다. 시험 시간은 45분이며, 컴퓨터로 진행됩니다. 불합격 시 10일 후 재응시가 가능합니다.',
                icon: 'fa-graduation-cap',
                color: '#27ae60'
              },
              {
                question: '외국인도 중국에서 운전면허를 취득할 수 있나요?',
                answer: '네, 가능합니다. 유효한 비자와 거류증을 소지한 외국인은 중국에서 운전면허를 취득할 수 있습니다. 신체검사, 서류 제출 후 각 과목 시험을 통과하면 됩니다. 일부 도시에서는 한국어 시험도 제공됩니다.',
                icon: 'fa-passport',
                color: '#e74c3c'
              },
              {
                question: '한국 운전면허를 중국 면허로 교환할 수 있나요?',
                answer: '네, 가능합니다. 한국 운전면허증을 소지한 경우, 중국 대사관에서 공증을 받은 후 과목1(이론시험)만 통과하면 중국 운전면허로 교환할 수 있습니다. 장내기능 및 도로주행 시험은 면제됩니다.',
                icon: 'fa-exchange-alt',
                color: '#9b59b6'
              },
              {
                question: '시험 예약은 어떻게 하나요?',
                answer: '시험 예약은 각 지역 교통관리국 홈페이지나 앱을 통해 가능합니다. 운전학원을 통해 등록한 경우 학원에서 예약을 대행해주기도 합니다. 시험일 최소 3일 전에는 예약을 완료해야 합니다.',
                icon: 'fa-calendar-check',
                color: '#f39c12'
              },
              {
                question: '시험에 불합격하면 어떻게 되나요?',
                answer: '불합격 시 10일 후 재응시가 가능합니다. 과목2와 과목3는 각각 5회까지 응시 기회가 주어지며, 5회 모두 불합격 시 처음부터 다시 시작해야 합니다. 과목1과 과목4는 응시 횟수 제한이 없습니다.',
                icon: 'fa-rotate-left',
                color: '#e67e22'
              },
              {
                question: '운전면허 취득에 드는 비용은 얼마인가요?',
                answer: '지역과 학원에 따라 다르지만, 일반적으로 3,000~5,000위안 정도입니다. 이 비용에는 등록비, 교육비, 시험 응시료가 포함됩니다. 재시험 응시료는 별도로 부과될 수 있습니다.',
                icon: 'fa-won-sign',
                color: '#16a085'
              },
              {
                question: '이론 공부는 얼마나 해야 하나요?',
                answer: '개인차가 있지만, 평균적으로 1~2주 정도 집중 공부하면 충분합니다. 본 사이트의 순서 연습, 주제별 연습, 모의고사 기능을 활용하면 효율적으로 준비할 수 있습니다. 매일 1~2시간씩 꾸준히 공부하는 것을 권장합니다.',
                icon: 'fa-book-open',
                color: '#2980b9'
              }
            ].map((faq, index) => (
              <details key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
                <summary className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: faq.color }}
                  >
                    <i className={`fa-solid ${faq.icon} text-white text-xl`}></i>
                  </div>
                  <span className="flex-1 font-medium text-gray-800">{faq.question}</span>
                  <i className="fa-solid fa-chevron-down text-gray-400 transition-transform group-open:rotate-180"></i>
                </summary>
                <div className="px-5 pb-5 pl-20 text-gray-600 leading-relaxed bg-gray-50">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          {/* 추가 도움말 */}
          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-4">
              <i className="fa-solid fa-circle-info text-3xl" style={{ color: '#37a7f0' }}></i>
              <div>
                <h3 className="text-lg mb-2">더 궁금한 점이 있으신가요?</h3>
                <p className="text-gray-600 mb-4">
                  위 FAQ에서 답을 찾지 못하셨다면 커뮤니티에서 다른 사용자들과 정보를 공유하거나, 위챗을 통해 상담을 받아보세요.
                </p>
                <div className="flex gap-3">
                  <button className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    커뮤니티 가기
                  </button>
                  <button className="px-6 py-2 rounded-lg text-white transition-colors" style={{ backgroundColor: '#37a7f0' }}>
                    위챗 상담하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : currentView === 'favorites' ? (
        // 즐겨찾기 페이지 - 문항 풀이 기능
        <FavoritesQuizPage />
      ) : currentView === 'app123' ? (
        // 123123 앱 페이지
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="py-4 text-sm text-gray-500 border-b mb-6">
            현재 위치: 홈 &gt; 123123 앱
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl mb-4">123123 앱</h2>
            <p className="text-gray-600 mb-6">중국 거주 한국인을 위한 필수 생활 앱 모음</p>
          </div>

          {/* 앱 카테고리 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 긴급 전화 앱 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                  <i className="fa-solid fa-phone"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">긴급 전화</h3>
                  <p className="text-sm text-gray-500">응급 상황 대응</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">경찰 (报警)</span>
                  <a href="tel:110" className="text-blue-600 font-semibold">110</a>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">화재 (火警)</span>
                  <a href="tel:119" className="text-blue-600 font-semibold">119</a>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">응급 (急救)</span>
                  <a href="tel:120" className="text-blue-600 font-semibold">120</a>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">교통 사고 (交通)</span>
                  <a href="tel:122" className="text-blue-600 font-semibold">122</a>
                </div>
              </div>
            </div>

            {/* 한국 대사관 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                  <i className="fa-solid fa-flag"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">한국 대사관</h3>
                  <p className="text-sm text-gray-500">영사 서비스</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">베이징 대사관</span>
                  <a href="tel:010-8531-0404" className="text-blue-600 font-semibold text-xs">010-8531-0404</a>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">상하이 총영사관</span>
                  <a href="tel:021-6295-5000" className="text-blue-600 font-semibold text-xs">021-6295-5000</a>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">칭다오 총영사관</span>
                  <a href="tel:0532-8897-6001" className="text-blue-600 font-semibold text-xs">0532-8897-6001</a>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">24시간 영사콜센터</span>
                  <a href="tel:+86-10-8531-0404" className="text-blue-600 font-semibold text-xs">+86-10-8531-0404</a>
                </div>
              </div>
            </div>

            {/* 생활 정보 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                  <i className="fa-solid fa-info-circle"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">생활 정보</h3>
                  <p className="text-sm text-gray-500">유용한 번호</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">날씨 문의</span>
                  <a href="tel:12121" className="text-blue-600 font-semibold">12121</a>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">전화번호 안내</span>
                  <a href="tel:114" className="text-blue-600 font-semibold">114</a>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">택시 콜센터</span>
                  <a href="tel:96103" className="text-blue-600 font-semibold">96103</a>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">소비자 보호</span>
                  <a href="tel:12315" className="text-blue-600 font-semibold">12315</a>
                </div>
              </div>
            </div>

            {/* 번역 앱 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                  <i className="fa-solid fa-language"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">번역 앱</h3>
                  <p className="text-sm text-gray-500">추천 번역기</p>
                </div>
              </div>
              <div className="space-y-3">
                <button className="w-full p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">파파고</span>
                    <i className="fa-solid fa-external-link text-gray-400"></i>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">네이버 번역</p>
                </button>
                <button className="w-full p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">구글 번역</span>
                    <i className="fa-solid fa-external-link text-gray-400"></i>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Google Translate</p>
                </button>
                <button className="w-full p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">바이두 번역</span>
                    <i className="fa-solid fa-external-link text-gray-400"></i>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">百度翻译</p>
                </button>
              </div>
            </div>

            {/* 지도 앱 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                  <i className="fa-solid fa-map-marked-alt"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">지도 앱</h3>
                  <p className="text-sm text-gray-500">내비게이션</p>
                </div>
              </div>
              <div className="space-y-3">
                <button className="w-full p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">바이두 지도</span>
                    <i className="fa-solid fa-external-link text-gray-400"></i>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">百度地图 - 가장 많이 사용</p>
                </button>
                <button className="w-full p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">가오더 지도</span>
                    <i className="fa-solid fa-external-link text-gray-400"></i>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">高德地图</p>
                </button>
                <button className="w-full p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">텐센트 지도</span>
                    <i className="fa-solid fa-external-link text-gray-400"></i>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">腾讯地图</p>
                </button>
              </div>
            </div>

            {/* 배달 앱 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                  <i className="fa-solid fa-utensils"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">배달 앱</h3>
                  <p className="text-sm text-gray-500">음식 배달</p>
                </div>
              </div>
              <div className="space-y-3">
                <button className="w-full p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">어러머</span>
                    <i className="fa-solid fa-external-link text-gray-400"></i>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">饿了么 - 배달의민족</p>
                </button>
                <button className="w-full p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">메이투안</span>
                    <i className="fa-solid fa-external-link text-gray-400"></i>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">美团外卖</p>
                </button>
                <button className="w-full p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">디디 푸드</span>
                    <i className="fa-solid fa-external-link text-gray-400"></i>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">滴滴外卖</p>
                </button>
              </div>
            </div>
          </div>

          {/* 추가 안내 */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb text-yellow-500"></i>
              사용 팁
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-green-600 mt-1"></i>
                <span>긴급 상황 시 즉시 110 (경찰), 119 (화재), 120 (응급)으로 연락하세요.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-green-600 mt-1"></i>
                <span>중국어가 어려운 경우 한국 대사관 24시간 영사콜센터를 이용하세요.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-green-600 mt-1"></i>
                <span>VPN을 사용하면 한국 앱들을 더 원활하게 이용할 수 있습니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-green-600 mt-1"></i>
                <span>위챗페이와 알리페이는 중국 생활 필수 결제 앱입니다.</span>
              </li>
            </ul>
          </div>
        </div>
      ) : currentView === 'community' ? (
        // 커뮤니티 페이지
        <DriverLicenseCommunity />
      ) : currentView === 'sequential' ? (
        // 순서 연습 페이지
        <SequentialPracticePage onBack={() => setCurrentView('practice')} />
      ) : currentView === 'chapter' ? (
        // 주제별 연습 페이지
        <ChapterPracticePage onBack={() => setCurrentView('practice')} selectedCity={selectedCity} />
      ) : currentView === 'difficult' ? (
        // 난점 공략 페이지
        <DifficultPointsPage onBack={() => setCurrentView('practice')} />
      ) : (
        // 동영상 강의 페이지
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="py-4 text-sm text-gray-500 border-b mb-6">
            현재 위치: 홈 &gt; 동영상 강의
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl mb-2">동영상 강의</h2>
            <p className="text-gray-600">전문가가 알려주는 운전면허 합격 비법을 영상으로 확인하세요.</p>
          </div>

          {/* 강의 카테고리 */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {['전체', '과목1 이론', '교통 표지판', '운전 기술', '시험 팁'].map((category) => (
              <button 
                key={category}
                className="px-6 py-2 bg-white border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-colors whitespace-nowrap"
              >
                {category}
              </button>
            ))}
          </div>

          {/* 동영상 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: '과목1 완벽 정복 - 100점 받는 비법',
                duration: '45:32',
                views: '12,453',
                thumbnail: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=225&fit=crop',
                category: '과목1 이론',
                instructor: '김지훈 강사'
              },
              {
                title: '교통 표지판 완전 정리 (2025 최신)',
                duration: '32:15',
                views: '8,921',
                thumbnail: 'https://images.unsplash.com/photo-1502764613149-7f1d229e2300?w=400&h=225&fit=crop',
                category: '교통 표지판',
                instructor: '이미영 강사'
              },
              {
                title: '자주 틀리는 문제 TOP 20',
                duration: '28:47',
                views: '15,782',
                thumbnail: 'https://images.unsplash.com/photo-1485463611174-f302f6a5c1c9?w=400&h=225&fit=crop',
                category: '시험 팁',
                instructor: '박민수 강사'
              },
              {
                title: '운전 기초 - 안전 운전의 모든 것',
                duration: '52:18',
                views: '9,234',
                thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=225&fit=crop',
                category: '운전 기술',
                instructor: '최수정 강사'
              },
              {
                title: '시험장에서 당황하지 않는 법',
                duration: '19:25',
                views: '6,745',
                thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=225&fit=crop',
                category: '시험 팁',
                instructor: '정혁진 강사'
              },
              {
                title: '야간 운전 및 악천후 주행 요령',
                duration: '38:52',
                views: '7,891',
                thumbnail: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&h=225&fit=crop',
                category: '운전 기술',
                instructor: '강민호 강사'
              }
            ].map((video, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                {/* 썸네일 */}
                <div className="relative aspect-video bg-gray-200">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fa-solid fa-play text-2xl ml-1" style={{ color: '#37a7f0' }}></i>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>

                {/* 콘텐츠 */}
                <div className="p-4">
                  <span className="inline-block text-xs px-2 py-1 rounded mb-2" style={{ backgroundColor: '#e3f2fd', color: '#37a7f0' }}>
                    {video.category}
                  </span>
                  <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-user-tie"></i>
                      {video.instructor}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-eye"></i>
                      {video.views}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 더보기 버튼 */}
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors">
              강의 더보기 <i className="fa-solid fa-chevron-down ml-2"></i>
            </button>
          </div>

          {/* 학습 가이드 */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#37a7f0' }}>
                <i className="fa-solid fa-lightbulb text-white text-xl"></i>
              </div>
              <h4 className="font-medium mb-2">학습 팁</h4>
              <p className="text-sm text-gray-600">동영상 강의와 문제 풀이를 병행하면 학습 효과가 2배!</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#27ae60' }}>
                <i className="fa-solid fa-bookmark text-white text-xl"></i>
              </div>
              <h4 className="font-medium mb-2">북마크 기능</h4>
              <p className="text-sm text-gray-600">중요한 강의는 즐겨찾기에 저장하여 나중에 다시 볼 수 있어요.</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#9b59b6' }}>
                <i className="fa-solid fa-clock text-white text-xl"></i>
              </div>
              <h4 className="font-medium mb-2">언제 어디서나</h4>
              <p className="text-sm text-gray-600">모바일로도 시청 가능! 이동 중에도 편하게 학습하세요.</p>
            </div>
          </div>
        </div>
      )}

      {/* Font Awesome & Google Fonts 로드 */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link 
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" 
        rel="stylesheet"
      />
    </div>
  );
}