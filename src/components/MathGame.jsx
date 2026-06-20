import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Clock, ShieldAlert, CheckCircle2, Skull } from 'lucide-react';

export default function MathGame({ player, gameMode, title, operatorChar, difficulty = 'medio' }) {
  const navigate = useNavigate();
  const [score, setScore] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(30); 
  const [totalTime, setTotalTime] = useState(0); 
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [revealed, setRevealed] = useState(false); 
  const [shakeButton, setShakeButton] = useState(null);
  const [showError, setShowError] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: '', success: true });
  const [savingScore, setSavingScore] = useState(false);
  
  const timerRef = useRef(null);
  const globalTimerRef = useRef(null);

  const getQuestionTimeLimit = () => {
    if (difficulty === 'facil') return 60;
    if (difficulty === 'dificil') return 10;
    return 30; // medio
  };

  const generateQuestion = (currentScore) => {
    let num1, num2, correct;
    const multiplier = difficulty === 'dificil' ? 10 : (difficulty === 'facil' ? 1 : 2);

    if (gameMode === 'somas') {
      let min1, max1, min2, max2;
      if (currentScore < 5) { min1 = 1 * multiplier; max1 = 9 * multiplier; min2 = 1 * multiplier; max2 = 9 * multiplier; }
      else if (currentScore < 15) { min1 = 10 * multiplier; max1 = 99 * multiplier; min2 = 1 * multiplier; max2 = 9 * multiplier; }
      else { min1 = 10 * multiplier; max1 = 99 * multiplier; min2 = 10 * multiplier; max2 = 99 * multiplier; }
      num1 = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;
      num2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
      correct = num1 + num2;

    } else if (gameMode === 'subtracoes') {
      let min1, max1, min2, max2;
      if (currentScore < 5) { min1 = 5 * multiplier; max1 = 15 * multiplier; min2 = 1 * multiplier; max2 = 9 * multiplier; }
      else { min1 = 20 * multiplier; max1 = 99 * multiplier; min2 = 5 * multiplier; max2 = 49 * multiplier; }
      
      num1 = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;
      num2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
      if (num1 < num2) { const temp = num1; num1 = num2; num2 = temp; }
      correct = num1 - num2;

    } else if (gameMode === 'multiplicacao') {
      let min1, max1, min2, max2;
      if (currentScore < 5) { min1 = 2; max1 = 5 * multiplier; min2 = 2; max2 = 5; }
      else { min1 = 5; max1 = 12 * multiplier; min2 = 5; max2 = 12; }
      
      num1 = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;
      num2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
      correct = num1 * num2;

    } else if (gameMode === 'divisao') {
      let min1, max1, min2, max2;
      if (currentScore < 5) { min1 = 2; max1 = 5 * multiplier; min2 = 2; max2 = 5; }
      else { min1 = 5; max1 = 12 * multiplier; min2 = 2; max2 = 12; }
      
      correct = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;
      num2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
      num1 = correct * num2;
    }

    const opts = new Set([correct]);
    while(opts.size < 5) {
      let wrongAnswer = correct + (Math.floor(Math.random() * 21) - 10);
      if(wrongAnswer !== correct && wrongAnswer >= 0) opts.add(wrongAnswer);
    }
    const shuffledOpts = Array.from(opts).sort(() => Math.random() - 0.5);

    setQuestion({ num1, num2, correct });
    setOptions(shuffledOpts);
    setRevealed(false);
  };

  const startNewGame = () => {
    setScore(0);
    setTimeLeft(getQuestionTimeLimit());
    setTotalTime(0);
    setIsGameOver(false);
    setShowModal(false);
    setShowError(false);
    setRevealed(false);
    generateQuestion(0);
    
    clearInterval(timerRef.current);
    clearInterval(globalTimerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleGameOverTimeout(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    globalTimerRef.current = setInterval(() => {
      setTotalTime((prev) => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    startNewGame();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(globalTimerRef.current);
    };
  }, []);

  const handleGameOverTimeout = (currentScore) => {
    setIsGameOver(true);
    setRevealed(true);
    setShowError(true);
    showToast('¡Se acabó el tiempo! ⏰', false);
    setTimeout(() => { triggerGameOverFlow(currentScore); }, 2000);
  };

  const handleGameOverMistake = (currentScore, wrongIndex) => {
    setIsGameOver(true);
    setRevealed(true);
    setShakeButton(wrongIndex);
    setShowError(true);
    showToast('¡Uy! Esa no era ❌', false);
    
    clearInterval(timerRef.current);
    clearInterval(globalTimerRef.current);

    setTimeout(() => {
      triggerGameOverFlow(currentScore);
    }, 2000);
  };

  const triggerGameOverFlow = (finalScore) => {
    setShowModal(true);
    saveScoreToDB(finalScore, totalTime);
  };

  const saveScoreToDB = async (finalScore, finalTotalTime) => {
    if (finalScore > 0) {
      setSavingScore(true);
      try {
        const { error } = await supabase.from('scores').insert([
          { player_id: player.id, game_mode: `${gameMode}_${difficulty}`, score: finalScore, time_taken: finalTotalTime }
        ]);
        if (error) throw error;
      } catch (err) {
        showToast('¡Error al guardar en el servidor!', false);
        console.error('Error saving score:', err);
      } finally {
        setSavingScore(false);
      }
    }
  };

  const checkAnswer = (selectedOpt, index) => {
    if (isGameOver) return;

    if (selectedOpt === question.correct) {
      const newScore = score + 1;
      setScore(newScore);
      showToast('¡Correcto! ✨', true);
      
      setTimeLeft(getQuestionTimeLimit());
      generateQuestion(newScore);
    } else {
      handleGameOverMistake(score, index);
    }
  };

  const showToast = (message, success) => {
    setToast({ show: true, message, success });
    setTimeout(() => setToast({ show: false, message: '', success: true }), 1500);
  };

  const getTimerColor = () => {
    const percentage = (timeLeft / getQuestionTimeLimit()) * 100;
    if (percentage <= 20) return 'bg-rose-500 shadow-[0_0_10px_#f43f5e]';
    if (percentage <= 50) return 'bg-amber-400 shadow-[0_0_10px_#fbbf24]';
    return 'bg-neon-green shadow-[0_0_10px_#39ff14]';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass-panel rounded-3xl w-full max-w-md p-6 border-t-4 border-neon-green relative overflow-hidden">
        
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-green rounded-full blur-[60px] opacity-20 pointer-events-none"></div>

        <div className="flex justify-between items-center mb-8 relative z-10">
          <button onClick={() => navigate('/')} className="glass-button p-3 rounded-2xl text-slate-300 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex space-x-3">
            <div className="glass-panel-light text-slate-200 px-4 py-2 rounded-2xl font-bold flex items-center space-x-2">
              <Clock size={16} className="text-neon-blue"/> <span className="w-6 text-center">{totalTime}s</span>
            </div>
            <div className="bg-neon-green/20 border border-neon-green/50 text-neon-green px-4 py-2 rounded-2xl font-black shadow-[0_0_15px_rgba(57,255,20,0.2)]">
              {score} Aciertos
            </div>
          </div>
        </div>

        <div className="mb-4 relative z-10">
            <h2 className="text-center text-xl font-bold text-white tracking-widest uppercase mb-4">{title}</h2>
        </div>

        <div className="mb-8 relative z-10">
          <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">
            <span>Energía de la Pregunta</span>
            <span className={timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}>{timeLeft}s</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-white/10">
            <div 
              className={`h-3 rounded-full timer-transition ${getTimerColor()}`} 
              style={{ width: `${(timeLeft / getQuestionTimeLimit()) * 100}%` }}
            ></div>
          </div>
        </div>

        {question && (
          <div className="glass-panel-light rounded-3xl p-8 mb-8 flex justify-center border-t border-white/20 pop relative z-10">
            <div className="text-7xl font-black text-white tracking-wider text-right flex flex-col items-end leading-none font-mono drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              <div className="pr-2">{question.num1}</div>
              <div className="flex items-center">
                <span className="text-neon-green mr-6">{operatorChar}</span>
                <span className="pr-2">{question.num2}</span>
              </div>
              <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-white/50 to-white/50 rounded-full my-5"></div>
              <div className="text-transparent">?</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
          {options.map((opt, index) => {
            const isCorrect = question && opt === question.correct;
            let btnClasses = 'glass-panel text-white border-white/10 hover:border-neon-green/50 hover:bg-neon-green/10 hover:text-neon-green hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] active:scale-95';
            
            if (revealed) {
              if (isCorrect) {
                btnClasses = 'bg-emerald-500/80 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.8)] scale-105 z-10';
              } else if (shakeButton === index) {
                btnClasses = 'bg-rose-500/50 border-rose-500 text-rose-200 shake shadow-[0_0_15px_rgba(244,63,94,0.6)]';
              } else {
                btnClasses = 'glass-panel text-white/30 border-white/5 scale-95 opacity-50';
              }
            }

            return (
              <button
                key={index}
                onClick={() => checkAnswer(opt, index)}
                disabled={isGameOver}
                className={`text-3xl font-black py-5 px-2 rounded-2xl transition-all border ${btnClasses} ${index === 4 ? 'col-span-2' : ''}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 px-8 py-3 rounded-2xl font-black text-white transition-all duration-300 pointer-events-none z-20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/20 backdrop-blur-md ${toast.success ? 'bg-emerald-500/80' : 'bg-rose-500/80'} ${toast.show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-90'}`}>
          {toast.message}
        </div>

        {showModal && (
          <div className="absolute inset-0 modal-overlay bg-black/60 flex flex-col items-center justify-center z-30 p-6">
            <div className="glass-panel-light border border-white/20 p-8 rounded-3xl text-center w-full max-w-sm pop shadow-[0_0_40px_rgba(0,0,0,0.8)]">
              
              <div className="w-24 h-24 bg-rose-500/20 border-2 border-rose-500/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <Skull size={48} className="text-rose-400" />
              </div>
              
              <h3 className="text-3xl font-black text-white mb-2">¡Fin de la Misión!</h3>
              
              <p className="text-slate-300 mb-6 font-medium">La respuesta correcta era <span className="font-bold text-emerald-400 text-xl">{question?.correct}</span></p>

              <div className="bg-black/30 rounded-2xl p-4 mb-6 border border-white/5">
                <p className="text-slate-300 mb-2 font-medium">Sobreviviste por <span className="font-bold text-neon-blue">{totalTime}s</span></p>
                <p className="text-lg">y lograste <span className="font-black text-neon-green text-2xl">{score}</span> aciertos!</p>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={startNewGame} 
                  disabled={savingScore}
                  className="w-full bg-gradient-to-r from-neon-green to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-900 font-black py-4 px-6 rounded-2xl shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all disabled:opacity-50"
                >
                  {savingScore ? 'Transmitiendo Datos...' : 'Intentar de Nuevo 🚀'}
                </button>
                <button 
                  onClick={() => navigate('/ranking')} 
                  disabled={savingScore}
                  className="w-full glass-button text-white font-bold py-4 px-6 rounded-2xl transition-all disabled:opacity-50"
                >
                  Ver Ranking Global 🏆
                </button>
                <button 
                  onClick={() => navigate('/')} 
                  disabled={savingScore}
                  className="w-full py-3 text-slate-400 hover:text-white font-bold transition-colors"
                >
                  Volver al Menú
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
