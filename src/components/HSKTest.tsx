import React from 'react';
import { Trophy, RotateCcw, Volume2, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface HSKTestProps {
  selectedLevel: number;
  vocabularyData: any;
  testQuestions: any[];
  currentQuestion: number;
  userAnswers: number[];
  showResults: boolean;
  testStarted: boolean;
  femaleVoice: SpeechSynthesisVoice | null;
  onGenerateTest: (num: number) => void;
  onSelectAnswer: (index: number) => void;
  onSubmitTest: () => void;
  onRestartTest: () => void;
  onSetCurrentQuestion: (index: number) => void;
  onSetActiveTab: (tab: string) => void;
}

export function HSKTest({
  selectedLevel,
  vocabularyData,
  testQuestions,
  currentQuestion,
  userAnswers,
  showResults,
  testStarted,
  femaleVoice,
  onGenerateTest,
  onSelectAnswer,
  onSubmitTest,
  onRestartTest,
  onSetCurrentQuestion,
  onSetActiveTab
}: HSKTestProps) {
  
  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    speechSynthesis.speak(utterance);
  };

  const calculateScore = () => {
    let correct = 0;
    testQuestions.forEach((question, index) => {
      if (userAnswers[index] === question.correctIndex) {
        correct++;
      }
    });
    return {
      correct,
      total: testQuestions.length,
      percentage: (correct / testQuestions.length) * 100
    };
  };

  // vocabularyData는 배열로 전달됨
  const currentVocabulary = Array.isArray(vocabularyData) ? vocabularyData : [];

  if (!testStarted) {
    // 시험 시작 전 화면
    return (
      <Card className="p-8 text-center max-w-2xl mx-auto">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          HSK {selectedLevel}급 단어 시험
        </h2>
        <p className="text-gray-600 mb-6">
          중국어 단어를 보고 올바른 한글 뜻을 선택하세요.
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => onGenerateTest(10)}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              시험 시작 (10문제)
            </Button>
            <Button
              onClick={() => onGenerateTest(20)}
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              시험 시작 (20문제)
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            레벨 {selectedLevel}에는 총 {currentVocabulary.length}개의 단어가 있습니다.
          </p>
        </div>
      </Card>
    );
  }

  if (showResults) {
    // 시험 결과 화면
    const score = calculateScore();
    return (
      <div>
        <Card className="p-8 max-w-3xl mx-auto mb-6">
          <div className="text-center mb-6">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              시험 완료!
            </h2>
            <div className="space-y-4">
              <div className="text-6xl font-bold text-green-600">
                {score.percentage.toFixed(0)}점
              </div>
              <div className="text-xl text-gray-700">
                {score.correct} / {score.total} 문제 정답
              </div>
              <Progress value={score.percentage} className="h-3" />
              <div className="flex justify-center gap-4 mt-6">
                <Button
                  onClick={onRestartTest}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  다시 시작
                </Button>
                <Button
                  onClick={() => onSetActiveTab('vocabulary')}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  단어 복습하기
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* 오답 노트 */}
        <Card className="p-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            문제 복습
          </h3>
          <div className="space-y-4">
            {testQuestions.map((question, index) => {
              const isCorrect = userAnswers[index] === question.correctIndex;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">
                        {index + 1}.
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-bold text-gray-900">
                            {question.chinese}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speakText(question.chinese)}
                            className="p-1 h-auto"
                          >
                            <Volume2 className="w-4 h-4 text-blue-600" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">{question.pinyin}</p>
                      </div>
                    </div>
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div className="ml-8 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium text-green-700">정답:</span>{' '}
                      {question.correctAnswer}
                    </p>
                    {!isCorrect && userAnswers[index] !== -1 && (
                      <p className="text-sm">
                        <span className="font-medium text-red-700">선택:</span>{' '}
                        {question.options[userAnswers[index]]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // 시험 진행 중 화면
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              문제 {currentQuestion + 1} / {testQuestions.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              답변: {userAnswers.filter(a => a !== -1).length} / {testQuestions.length}
            </span>
          </div>
          <Progress 
            value={((currentQuestion + 1) / testQuestions.length) * 100} 
            className="h-2 mb-6" 
          />
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-gray-600 mb-2">다음 단어의 뜻을 고르세요</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-4xl font-bold text-gray-900">
              {testQuestions[currentQuestion].chinese}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speakText(testQuestions[currentQuestion].chinese)}
              className="p-2"
            >
              <Volume2 className="w-6 h-6 text-blue-600" />
            </Button>
          </div>
          <p className="text-lg text-blue-600">
            {testQuestions[currentQuestion].pinyin}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testQuestions[currentQuestion].options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => onSelectAnswer(index)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                userAnswers[currentQuestion] === index
                  ? 'border-green-600 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-green-400 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    userAnswers[currentQuestion] === index
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-lg">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* 네비게이션 */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => {
            if (currentQuestion > 0) {
              onSetCurrentQuestion(currentQuestion - 1);
            }
          }}
          disabled={currentQuestion === 0}
          variant="outline"
          size="lg"
        >
          이��� 문제
        </Button>

        {currentQuestion === testQuestions.length - 1 ? (
          <Button
            onClick={onSubmitTest}
            disabled={userAnswers.filter(a => a !== -1).length !== testQuestions.length}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Trophy className="w-5 h-5 mr-2" />
            제출하기
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (currentQuestion < testQuestions.length - 1) {
                onSetCurrentQuestion(currentQuestion + 1);
              }
            }}
            className="bg-green-600 hover:bg-green-700"
            size="lg"
          >
            다음 문제
          </Button>
        )}
      </div>

      {/* 문제 번호 네비게이션 */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">문제 번호</h3>
        <div className="grid grid-cols-10 gap-2">
          {testQuestions.map((_, index) => (
            <button
              key={index}
              onClick={() => onSetCurrentQuestion(index)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                currentQuestion === index
                  ? 'bg-blue-600 text-white'
                  : userAnswers[index] !== -1
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}