import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Clock, ShieldAlert, BookOpen } from 'lucide-react';
import { 
  ShapeCircle, ShapeSquare, ShapeTriangle, ShapeHexagon, ShapeOctagon, ShapeStar, 
  ShapeRectangle, ShapeRombo, ShapeTrapecio, ShapePentagon,
  ShapeCubo, ShapeCilindro, ShapeEsfera, ShapeCono, ShapePiramide
} from '../components/CustomShapes';

const SHAPES = [
  { id: 'circulo', name: 'Círculo', icon: ShapeCircle, color: 'text-pink-500' },
  { id: 'cuadrado', name: 'Cuadrado', icon: ShapeSquare, color: 'text-blue-500' },
  { id: 'triangulo', name: 'Triángulo', icon: ShapeTriangle, color: 'text-emerald-500' },
  { id: 'rectangulo', name: 'Rectángulo', icon: ShapeRectangle, color: 'text-cyan-400' },
  { id: 'rombo', name: 'Rombo', icon: ShapeRombo, color: 'text-indigo-400' },
  { id: 'trapecio', name: 'Trapecio', icon: ShapeTrapecio, color: 'text-fuchsia-400' },
  { id: 'pentagono', name: 'Pentágono', icon: ShapePentagon, color: 'text-teal-400' },
  { id: 'hexagono', name: 'Hexágono', icon: ShapeHexagon, color: 'text-purple-500' },
  { id: 'octagono', name: 'Octágono', icon: ShapeOctagon, color: 'text-rose-500' },
  { id: 'estrella', name: 'Estrella', icon: ShapeStar, color: 'text-amber-400' },
  { id: 'cubo', name: 'Cubo (3D)', icon: ShapeCubo, color: 'text-orange-400' },
  { id: 'cilindro', name: 'Cilindro (3D)', icon: ShapeCilindro, color: 'text-lime-400' },
  { id: 'esfera', name: 'Esfera (3D)', icon: ShapeEsfera, color: 'text-sky-400' },
  { id: 'cono', name: 'Cono (3D)', icon: ShapeCono, color: 'text-red-400' },
  { id: 'piramide', name: 'Pirámide (3D)', icon: ShapePiramide, color: 'text-yellow-400' },
];

export default function FormasGame({ player, difficulty = 'medio' }) {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('study'); // 'study' or 'play'
  const [score, setScore] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(30); 
  const [totalTime, setTotalTime] = useState(0); 
  const [currentShape, setCurrentShape] = useState(null);
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

  const TIMER_TOTAL = getQuestionTimeLimit();

  const generateQuestion = () => {
    // 1. Pick a random shape
    const correctShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    
    // 2. Pick 3 wrong shapes
    const wrongShapes = [];
    while (wrongShapes.length < 3) {
      const randomWrong = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      if (randomWrong.id !== correctShape.id && !wrongShapes.find(s => s.id === randomWrong.id)) {
        wrongShapes.push(randomWrong);
      }
    }
    
    // 3. Shuffle options
    const allOptions = [correctShape, ...wrongShapes].sort(() => Math.random() - 0.5);

    setCurrentShape(correctShape);
    setOptions(allOptions);
    setRevealed(false);
    setTimeLeft(getQuestionTimeLimit());
  };

  const startNewGame = () => {
    setGameState('play');
    setScore(0);
    setTimeLeft(getQuestionTimeLimit());
    setTotalTime(0);
    setIsGameOver(false);
    setShowModal(false);
    setShowError(false);
    setRevealed(false);
    generateQuestion();
    
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
    showToast('¡Esa forma no es! ❌', false);
    
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
          { player_id: player.id, game_mode: `formas_${difficulty}`, score: finalScore, time_taken: finalTotalTime }
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

    if (selectedOpt.id === currentShape.id) {
      const newScore = score + 1;
      setScore(newScore);
      showToast('¡Correcto! ✨', true);
      
      generateQuestion();
    } else {
      handleGameOverMistake(score, index);
    }
  };

  const showToast = (message, success) => {
    setToast({ show: true, message, success });
    setTimeout(() => setToast({ show: false, message: '', success: true }), 1500);
  };

  const getTimerColor = () => {
    const percentage = (timeLeft / TIMER_TOTAL) * 100;
    if (percentage <= 20) return 'bg-rose-500 shadow-[0_0_10px_#f43f5e]';
    if (percentage <= 50) return 'bg-amber-400 shadow-[0_0_10px_#fbbf24]';
    return 'bg-neon-green shadow-[0_0_10px_#39ff14]';
  };

  const ShapeIcon = currentShape?.icon;

  if (gameState === 'study') {
    return (
      <div className="min-h-screen flex flex-col items-center p-6 pt-12">
        <div className="w-full max-w-4xl relative z-10 pop">
          
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate('/')} className="glass-button p-3 rounded-2xl text-slate-300 hover:text-white transition-all">
              <ArrowLeft size={24} />
            </button>
            <div className="glass-panel-light px-6 py-3 rounded-2xl border border-white/20">
              <h2 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                <BookOpen size={24} className="text-pink-400" />
                Estudiar Formas
              </h2>
            </div>
            <div className="w-12"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
            {SHAPES.map((shape) => {
              const Icon = shape.icon;
              return (
                <div key={shape.id} className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center border border-white/10 hover:bg-white/5 transition-all">
                  <div className={`mb-3 ${shape.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`}>
                    <Icon size={48} strokeWidth={1.5} />
                  </div>
                  <span className="text-white font-bold text-sm tracking-wide text-center">{shape.name}</span>
                </div>
              );
            })}
          </div>

          <button 
            onClick={startNewGame}
            className="w-full max-w-sm mx-auto block bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-xl py-5 rounded-2xl shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-all transform hover:-translate-y-1"
          >
            ¡Poner a prueba! 🚀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass-panel rounded-3xl w-full max-w-md p-6 border-t-4 border-pink-500 relative overflow-hidden">
        
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>

        <div className="flex justify-between items-center mb-8 relative z-10">
          <button onClick={() => navigate('/')} className="glass-button p-3 rounded-2xl text-slate-300 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex space-x-3">
            <div className="glass-panel-light text-slate-200 px-4 py-2 rounded-2xl font-bold flex items-center space-x-2">
              <Clock size={16} className="text-neon-blue"/> <span className="w-6 text-center">{totalTime}s</span>
            </div>
            <div className="bg-pink-500/20 border border-pink-500/50 text-pink-400 px-4 py-2 rounded-2xl font-black shadow-[0_0_15px_rgba(236,72,153,0.2)]">
              {score} Aciertos
            </div>
          </div>
        </div>

        <div className="mb-4 relative z-10">
            <h2 className="text-center text-xl font-bold text-white tracking-widest uppercase mb-4">Adivina la Forma</h2>
        </div>

        <div className="mb-8 relative z-10">
          <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">
            <span>Energía</span>
            <span className={timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}>{timeLeft}s</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-white/10">
            <div 
              className={`h-3 rounded-full timer-transition ${getTimerColor()}`} 
              style={{ width: `${(timeLeft / TIMER_TOTAL) * 100}%` }}
            ></div>
          </div>
        </div>

        {currentShape && (
          <div className="glass-panel-light rounded-3xl p-8 mb-8 flex justify-center items-center border-t border-white/20 pop relative z-10 min-h-[200px]">
            <div className={`transition-all duration-500 ${currentShape.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse-slow`}>
              <ShapeIcon size={120} strokeWidth={1.5} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
          {options.map((opt, index) => {
            const isCorrect = currentShape && opt.id === currentShape.id;
            let btnClasses = 'glass-panel text-white border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-400 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] active:scale-95';
            
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
                className={`text-lg font-black py-5 px-2 rounded-2xl transition-all border ${btnClasses}`}
              >
                {opt.name}
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
                <ShieldAlert size={48} className="text-rose-400" />
              </div>
              
              <h3 className="text-3xl font-black text-white mb-2">¡Fin de la Misión!</h3>
              
              <p className="text-slate-300 mb-6 font-medium">La forma correcta era <span className="font-bold text-pink-400 text-xl">{currentShape?.name}</span></p>

              <div className="bg-black/30 rounded-2xl p-4 mb-6 border border-white/5">
                <p className="text-slate-300 mb-2 font-medium">Sobreviviste por <span className="font-bold text-neon-blue">{totalTime}s</span></p>
                <p className="text-lg">y lograste <span className="font-black text-pink-400 text-2xl">{score}</span> aciertos!</p>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={startNewGame} 
                  disabled={savingScore}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black py-4 px-6 rounded-2xl shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all disabled:opacity-50"
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
