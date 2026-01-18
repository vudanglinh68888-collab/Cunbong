
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { QuizQuestion } from '../types';
import { geminiService } from '../services/geminiService';

interface QuizViewProps {
  topic: string;
}

export const QuizView: React.FC<QuizViewProps> = ({ topic }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const fetchQuiz = async () => {
    setLoading(true);
    setQuizFinished(false);
    setCurrentQIndex(0);
    setScore(0);
    resetQuestionState();
    
    try {
      const data = await geminiService.generateQuiz(topic);
      setQuestions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  const resetQuestionState = () => {
    setSelectedOption(null);
    setShowResult(false);
  };

  const handleOptionClick = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
    setShowResult(true);
    if (option === questions[currentQIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      setQuizFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <Loader2 className="w-10 h-10 text-pink-600 animate-spin mb-4" />
        <h3 className="text-xl font-medium text-gray-800">Đang tạo bài kiểm tra...</h3>
        <p className="text-gray-500 mt-2">Gemini đang soạn câu hỏi về "{topic}"</p>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center animate-fade-in">
        <Award className="w-20 h-20 text-yellow-500 mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Hoàn thành!</h2>
        <p className="text-xl text-gray-600 mb-8">
          Bạn trả lời đúng <span className="font-bold text-indigo-600">{score}/{questions.length}</span> câu hỏi.
        </p>
        <button
          onClick={fetchQuiz}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg"
        >
          Làm bài mới
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-8">
        <p>Không có câu hỏi nào. Vui lòng thử lại.</p>
        <button onClick={fetchQuiz} className="mt-4 text-indigo-600 font-medium">Thử lại</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQIndex];

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="mb-8">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Câu hỏi {currentQIndex + 1}/{questions.length}</span>
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-2 leading-relaxed">
          What is the meaning of "{currentQuestion.word}"?
        </h3>
      </div>

      <div className="space-y-3">
        {currentQuestion.options.map((option, idx) => {
          let optionClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 font-medium ";
          
          if (showResult) {
            if (option === currentQuestion.correctAnswer) {
              optionClass += "border-green-500 bg-green-50 text-green-700";
            } else if (option === selectedOption) {
              optionClass += "border-red-500 bg-red-50 text-red-700";
            } else {
              optionClass += "border-gray-100 bg-white opacity-50";
            }
          } else {
            optionClass += "border-gray-100 bg-white hover:border-indigo-200 hover:bg-indigo-50 text-gray-700 shadow-sm";
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              disabled={showResult}
              className={optionClass}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showResult && option === currentQuestion.correctAnswer && <CheckCircle className="w-5 h-5 text-green-600" />}
                {showResult && option === selectedOption && option !== currentQuestion.correctAnswer && <XCircle className="w-5 h-5 text-red-600" />}
              </div>
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className="mt-6 animate-fade-in-up">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 text-sm text-blue-800">
            <strong>Giải thích:</strong> {currentQuestion.explanation}
          </div>
          <button
            onClick={nextQuestion}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            {currentQIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
