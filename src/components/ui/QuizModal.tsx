import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '../../data/eruvData';
import { soundManager } from '../../utils/audio';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  BookMarked,
  Award
} from 'lucide-react';

export const QuizModal: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const q = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    soundManager.playClick();
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    if (selectedOption === q.correctIndex) {
      soundManager.playRepairSound();
      setScore(s => s + 1);
    } else {
      soundManager.playError();
    }
  };

  const handleNextQuestion = () => {
    soundManager.playClick();
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx(i => i + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
      soundManager.playCelebration();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback
      }
    }
  };

  const handleRestart = () => {
    soundManager.playClick();
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto p-3 sm:p-6 text-slate-100">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800">
          Knowledge Check
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
          Eruv Halacha Master Quiz
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Test your mastery of Shabbat domain laws, doorway construction, and real-world halachic dilemmas!
        </p>
      </div>

      {!quizFinished ? (
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl">
          {/* Progress Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="text-xs font-mono font-bold text-slate-400">
              Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}
            </div>
            <div className="text-xs font-mono font-bold text-amber-400">
              Score: {score} / {currentIdx}
            </div>
          </div>

          {/* Scenario / Case Study */}
          <div className="mb-3 px-3.5 py-2 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="text-[10px] uppercase font-bold text-slate-400">Real-World Case Study:</div>
            <div className="text-xs text-slate-200 mt-0.5 font-medium">{q.scenario}</div>
          </div>

          {/* Question */}
          <h3 className="text-base sm:text-lg font-serif font-bold text-white mb-4">
            {q.question}
          </h3>

          {/* Options */}
          <div className="space-y-2.5 mb-6">
            {q.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = i === q.correctIndex;
              let btnClass = 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white';

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  btnClass = 'border-emerald-500 bg-emerald-950/50 text-emerald-200 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'border-rose-500 bg-rose-950/50 text-rose-200';
                } else {
                  btnClass = 'border-slate-800/40 bg-slate-900/40 text-slate-500';
                }
              } else if (isSelected) {
                btnClass = 'border-purple-500 bg-purple-950/40 text-white shadow-md';
              }

              return (
                <button
                  key={i}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSelectOption(i)}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${btnClass}`}
                >
                  <span className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center shrink-0 text-xs font-mono">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Halachic Explanation (Visible after answering) */}
          {isAnswerSubmitted && (
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 mb-6 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  selectedOption === q.correctIndex ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {selectedOption === q.correctIndex ? 'Correct!' : 'Incorrect'}
                </span>
                <span className="text-xs text-slate-400">Principle: {q.halachicPrinciple}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{q.explanation}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-mono">
                <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                <span>Source: {q.source}</span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!isAnswerSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <span>{currentIdx + 1 < QUIZ_QUESTIONS.length ? 'Next Question' : 'View Results'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Final Score & Certificate */
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-serif font-bold text-white">
            Quiz Completed!
          </h3>

          <div className="text-4xl font-mono font-extrabold text-amber-400">
            {score} / {QUIZ_QUESTIONS.length}
          </div>

          <p className="text-sm text-slate-300 max-w-md mx-auto">
            {score >= 6
              ? 'Outstanding! You have mastered the fundamentals of Shabbat carrying laws, Tzurat HaPetach, and communal eruvin!'
              : 'Good effort! Review the Beginner Visual Guide and give it another try to achieve your Eruv Inspector certification.'}
          </p>

          <div className="pt-4">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
