import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Volume2, Mic, CheckCircle, XCircle, TrendingUp, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { HSKTest } from '../components/HSKTest';
import { HSKVocabularyData } from '../data/HSKVocabulary';
import { ChineseSentencesData } from '../data/ChineseSentences';

interface HSKPageProps {
  onBack: () => void;
}

export function HSKPage({ onBack }: HSKPageProps) {
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'sentences' | 'test'>('vocabulary');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedDay, setSelectedDay] = useState<'day1' | 'day2' | 'day3' | 'day4' | 'day5'>('day1');
  const [isRecording, setIsRecording] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // 플래시 카드 인덱스
  const [showAnswer, setShowAnswer] = useState(false); // 플래시 카드 답 표시
  const [recordingResult, setRecordingResult] = useState<any>(null);
  const [userTranscript, setUserTranscript] = useState('');
  const [femaleVoice, setFemaleVoice] = useState<SpeechSynthesisVoice | null>(null);
  const recognitionRef = useRef<any>(null);

  // 시험 관련 state
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  // 중국어 여성 목소리 찾기
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      
      const preferredVoices = [
        'Microsoft Huihui',
        'Google 中文（中国）',
        'Ting-Ting',
        'Sin-Ji'
      ];

      let selectedVoice = null;

      for (const preferred of preferredVoices) {
        selectedVoice = voices.find(voice => 
          voice.name.includes(preferred) || 
          (voice.lang.includes('zh') && voice.name.toLowerCase().includes('female'))
        );
        if (selectedVoice) break;
      }

      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.includes('zh-CN') || voice.lang.includes('zh-Hans')
        );
      }

      setFemaleVoice(selectedVoice || null);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const vocabularyData = HSKVocabularyData;
  const sentencesData = ChineseSentencesData;

  // 현재 선택된 단어와 문장
  const currentVocabulary = vocabularyData[selectedLevel as keyof typeof vocabularyData]?.[selectedDay] || [];
  const currentSentences = sentencesData[selectedLevel as keyof typeof sentencesData]?.[selectedDay] || [];

  // 전체 단어 (모든 DAY 합치기 - 테스트용)
  const getAllVocabulary = () => {
    const levelData = vocabularyData[selectedLevel as keyof typeof vocabularyData];
    if (!levelData) return [];
    return Object.values(levelData).flat();
  };

  const getAllSentences = () => {
    const levelData = sentencesData[selectedLevel as keyof typeof sentencesData];
    if (!levelData) return [];
    return Object.values(levelData).flat();
  };

  // 객관식 문제 생성
  const generateTest = (numQuestions: number = 10) => {
    const vocab = getAllVocabulary();
    if (vocab.length === 0) {
      alert('이 레벨의 단어 데이터가 없습니다.');
      return;
    }

    const shuffled = [...vocab].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, Math.min(numQuestions, vocab.length));

    const questions = selectedWords.map((word, index) => {
      const wrongAnswers = vocab
        .filter(w => w.korean !== word.korean)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.korean);

      const options = [...wrongAnswers, word.korean].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(word.korean);

      return {
        id: index,
        chinese: word.chinese,
        pinyin: word.pinyin,
        correctAnswer: word.korean,
        options,
        correctIndex,
        category: word.category
      };
    });

    setTestQuestions(questions);
    setUserAnswers(new Array(questions.length).fill(-1));
    setCurrentQuestion(0);
    setTestStarted(true);
    setShowResults(false);
  };

  const selectAnswer = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const submitTest = () => {
    setShowResults(true);
  };

  const restartTest = () => {
    setTestStarted(false);
    setTestQuestions([]);
    setUserAnswers([]);
    setCurrentQuestion(0);
    setShowResults(false);
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    speechSynthesis.speak(utterance);
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('브라우저가 음성 인식을 지원하지 않습니다.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'zh-CN';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      setUserTranscript('');
      setRecordingResult(null);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      setUserTranscript(transcript);
      
      if (currentSentences.length > currentIndex) {
        const original = currentSentences[currentIndex].chinese;
        const similarity = calculateSimilarity(original, transcript);
        
        setRecordingResult({
          transcript,
          confidence: confidence * 100,
          similarity: similarity * 100,
          pitch: Math.random() * 40 + 60,
          accuracy: similarity > 0.8 ? 'excellent' : similarity > 0.6 ? 'good' : 'needsImprovement'
        });
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      alert('음성 인식 중 오류가 발생했습니다.');
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.start();
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const getEditDistance = (str1: string, str2: string): number => {
    const costs: number[] = [];
    for (let i = 0; i <= str1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= str2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[str2.length] = lastValue;
    }
    return costs[str2.length];
  };

  // 플래시 카드 이동
  const goToNext = () => {
    const dataSource = activeTab === 'vocabulary' ? currentVocabulary : currentSentences;
    if (currentIndex < dataSource.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setRecordingResult(null);
      setUserTranscript('');
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setRecordingResult(null);
      setUserTranscript('');
    }
  };

  const selectCard = (index: number) => {
    setCurrentIndex(index);
    setShowAnswer(false);
    setRecordingResult(null);
    setUserTranscript('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">HSK 학습 센터</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => {
                setActiveTab('vocabulary');
                setCurrentIndex(0);
                setShowAnswer(false);
              }}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'vocabulary'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              HSK 단어
            </button>
            <button
              onClick={() => {
                setActiveTab('sentences');
                setCurrentIndex(0);
                setShowAnswer(false);
              }}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'sentences'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              생활 중국어
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'test'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              테스트
            </button>
          </div>
        </div>
      </div>

      {/* Level & Day Selection */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">레벨:</span>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                onClick={() => {
                  setSelectedLevel(level);
                  setSelectedDay('day1');
                  setCurrentIndex(0);
                  setShowAnswer(false);
                  setRecordingResult(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedLevel === level
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Level {level}
              </button>
            ))}
          </div>
          
          {activeTab !== 'test' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">DAY:</span>
              {['day1', 'day2', 'day3', 'day4', 'day5'].map((day, index) => (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDay(day as any);
                    setCurrentIndex(0);
                    setShowAnswer(false);
                    setRecordingResult(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedDay === day
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  DAY {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'vocabulary' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Word List */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  단어 목록 ({currentVocabulary.length})
                </h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {currentVocabulary.map((word: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => selectCard(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentIndex === index
                          ? 'bg-green-50 border-2 border-green-600'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900">{word.chinese}</p>
                      <p className="text-xs text-gray-600 mt-1">{word.pinyin}</p>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right: Flashcard */}
            <div className="lg:col-span-2 space-y-6">
              {currentVocabulary.length > 0 && (
                <>
                  <Card className="p-8">
                    <div className="text-center mb-6">
                      <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                        {currentIndex + 1} / {currentVocabulary.length}
                      </span>
                      
                      {/* Flashcard */}
                      <div 
                        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-12 min-h-[300px] flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setShowAnswer(!showAnswer)}
                      >
                        <div className="text-center">
                          <h2 className="text-5xl font-bold text-gray-900 mb-4">
                            {currentVocabulary[currentIndex].chinese}
                          </h2>
                          <p className="text-xl text-blue-600 mb-6">
                            {currentVocabulary[currentIndex].pinyin}
                          </p>
                          
                          {showAnswer && (
                            <div className="mt-6 pt-6 border-t-2 border-gray-200">
                              <p className="text-2xl text-gray-700 font-medium">
                                {currentVocabulary[currentIndex].korean}
                              </p>
                              <span className="inline-block mt-4 bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm font-medium">
                                {currentVocabulary[currentIndex].category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mt-4">
                        💡 카드를 클릭하면 답이 나와요!
                      </p>
                    </div>

                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={() => speakText(currentVocabulary[currentIndex].chinese)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        듣기
                      </Button>
                      <Button
                        onClick={() => setShowAnswer(!showAnswer)}
                        variant="outline"
                      >
                        {showAnswer ? '답 숨기기' : '답 보기'}
                      </Button>
                    </div>
                  </Card>

                  {/* Navigation */}
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={goToPrev}
                      disabled={currentIndex === 0}
                      variant="outline"
                      size="lg"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      이전
                    </Button>
                    
                    <span className="text-gray-600">
                      {currentIndex + 1} / {currentVocabulary.length}
                    </span>

                    <Button
                      onClick={goToNext}
                      disabled={currentIndex === currentVocabulary.length - 1}
                      className="bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      다음
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : activeTab === 'sentences' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  문장 목록 ({currentSentences.length})
                </h3>
                {currentSentences.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>이 레벨의 생활 중국어 데이터가 아직 준비되지 않았습니다.</p>
                    <p className="text-sm mt-2">Level 1을 선택해주세요.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {currentSentences.map((sentence: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => selectCard(index)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          currentIndex === index
                            ? 'bg-green-50 border-2 border-green-600'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900">{sentence.chinese}</p>
                        <p className="text-xs text-gray-600 mt-1">{sentence.korean}</p>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {currentSentences.length > 0 && (
                <>
                  <Card className="p-6">
                    <div className="text-center mb-6">
                      <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                        문장 {currentIndex + 1} / {currentSentences.length}
                      </span>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {currentSentences[currentIndex].chinese}
                      </h2>
                      <p className="text-lg text-blue-600 mb-2">
                        {currentSentences[currentIndex].pinyin}
                      </p>
                      <p className="text-base text-gray-600">
                        {currentSentences[currentIndex].korean}
                      </p>
                    </div>

                    <div className="flex justify-center gap-4 mb-6">
                      <Button
                        onClick={() => speakText(currentSentences[currentIndex].chinese)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        듣기
                      </Button>
                      <Button
                        onClick={startRecording}
                        disabled={isRecording}
                        className={`${
                          isRecording
                            ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        {isRecording ? '녹음 중...' : '따라 읽기'}
                      </Button>
                    </div>

                    {recordingResult && (
                      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">분석 결과</h3>
                          {recordingResult.accuracy === 'excellent' ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : recordingResult.accuracy === 'good' ? (
                            <Award className="w-6 h-6 text-blue-600" />
                          ) : (
                            <TrendingUp className="w-6 h-6 text-orange-600" />
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">발음 정확도</span>
                              <span className="text-sm font-bold text-green-600">
                                {recordingResult.similarity.toFixed(0)}%
                              </span>
                            </div>
                            <Progress value={recordingResult.similarity} className="h-2" />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">인식 신뢰도</span>
                              <span className="text-sm font-bold text-blue-600">
                                {recordingResult.confidence.toFixed(0)}%
                              </span>
                            </div>
                            <Progress value={recordingResult.confidence} className="h-2" />
                          </div>

                          <div className="mt-4 p-4 bg-white rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-1">당신이 말한 내용:</p>
                            <p className="text-lg text-gray-900">{userTranscript}</p>
                          </div>

                          {recordingResult.accuracy === 'excellent' && (
                            <div className="mt-4 p-4 bg-green-100 rounded-lg">
                              <p className="text-sm font-semibold text-green-800">
                                🎉 완벽합니다! 발음이 매우 정확합니다!
                              </p>
                            </div>
                          )}
                          {recordingResult.accuracy === 'good' && (
                            <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                              <p className="text-sm font-semibold text-blue-800">
                                👍 좋습니다! 조금 더 연습하면 완벽해질 거예요!
                              </p>
                            </div>
                          )}
                          {recordingResult.accuracy === 'needsImprovement' && (
                            <div className="mt-4 p-4 bg-orange-100 rounded-lg">
                              <p className="text-sm font-semibold text-orange-800">
                                💪 계속 연습해보세요! 반복이 중요합니다!
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    )}
                  </Card>

                  <div className="flex justify-between">
                    <Button
                      onClick={goToPrev}
                      disabled={currentIndex === 0}
                      variant="outline"
                      size="lg"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      이전 문장
                    </Button>
                    <Button
                      onClick={goToNext}
                      disabled={currentIndex === currentSentences.length - 1}
                      className="bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      다음 문장
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <HSKTest
            selectedLevel={selectedLevel}
            vocabularyData={getAllVocabulary()}
            testQuestions={testQuestions}
            currentQuestion={currentQuestion}
            userAnswers={userAnswers}
            showResults={showResults}
            testStarted={testStarted}
            femaleVoice={femaleVoice}
            onGenerateTest={generateTest}
            onSelectAnswer={selectAnswer}
            onSubmitTest={submitTest}
            onRestartTest={restartTest}
            onSetCurrentQuestion={setCurrentQuestion}
            onSetActiveTab={(tab: string) => setActiveTab(tab as 'vocabulary' | 'sentences' | 'test')}
          />
        )}
      </div>
    </div>
  );
}