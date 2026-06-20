import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Clock, ShieldAlert, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import { generateProblem } from '../utils/problemGenerator';

export default function ProblemasGame({ player, difficulty = 'medio' }) {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState(null);
  const [step, setStep] = useState(1); // 1 = extract variables, 2 = solve
  
  const [varInputs, setVarInputs] = useState({});
  const [finalAnswer, setFinalAnswer] = useState('');
  
  const [timeTaken, setTimeTaken] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showError, setShowError] = useState(false);
  
  const globalTimerRef = useRef(null);

  useEffect(() => {
    startNewGame();
    return () => clearInterval(globalTimerRef.current);
  }, []);

  const getStartingLevel = () => {
    if (difficulty === 'facil') return 1;
    if (difficulty === 'dificil') return 4;
    return 2; // medio
  };

  const startNewGame = () => {
    const startLevel = getStartingLevel();
    setScore(0);
    setLevel(startLevel);
    setTimeTaken(0);
    setIsGameOver(false);
    setShowError(false);
    generateAndSetProblem(startLevel);
    
    clearInterval(globalTimerRef.current);
    globalTimerRef.current = setInterval(() => {
      setTimeTaken(prev => prev + 1);
    }, 1000);
  };

  const generateAndSetProblem = (currentLevel) => {
    const p = generateProblem(currentLevel);
    setProblem(p);
    setStep(1);
    setVarInputs({});
    setFinalAnswer('');
    setShowError(false);
  };

  const saveScore = async () => {
    try {
      await supabase.from('scores').insert([
        {
          player_id: player.id,
          game_mode: `problemas_${difficulty}`,
          score: score,
          time_taken: timeTaken
        }
      ]);
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    setShowError(true);
    clearInterval(globalTimerRef.current);
    saveScore();
  };

  const handleVarInputChange = (index, value) => {
    setVarInputs(prev => ({ ...prev, [index]: value }));
  };

  const validateStep1 = () => {
    // Check if all variables match exactly
    let allCorrect = true;
    problem.variables.forEach((v, index) => {
      if (parseInt(varInputs[index]) !== v.value) {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      setStep(2);
    } else {
      handleGameOver(); // Sudden death
    }
  };

  const validateStep2 = () => {
    if (parseInt(finalAnswer) === problem.answer) {
      // Correct!
      const newScore = score + 1;
      const startLevel = getStartingLevel();
      const newLevel = startLevel + Math.floor(newScore / 5);
      
      setScore(newScore);
      setLevel(newLevel);
      generateAndSetProblem(newLevel);
    } else {
      handleGameOver();
    }
  };

  if (!problem) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[120px] opacity-10"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-neon-blue rounded-full blur-[120px] opacity-10"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 pop">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('/')} className="glass-button p-3 rounded-2xl text-slate-300 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex space-x-4">
            <div className="glass-panel-light px-4 py-2 rounded-2xl flex items-center space-x-2">
              <span className="text-slate-400 font-bold uppercase text-xs">Nivel</span>
              <span className="font-black text-white text-xl">{level}</span>
            </div>
            <div className="glass-panel-light px-4 py-2 rounded-2xl flex items-center space-x-2">
              <span className="text-slate-400 font-bold uppercase text-xs">Aciertos</span>
              <span className="font-black text-neon-green text-xl">{score}</span>
            </div>
            <div className="glass-panel-light px-4 py-2 rounded-2xl flex items-center space-x-2">
              <Clock size={18} className="text-neon-blue" />
              <span className="font-black text-white text-xl">{timeTaken}s</span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className={`glass-panel rounded-3xl p-8 relative overflow-hidden transition-all duration-300 ${
          showError ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)] bg-rose-500/10' : ''
        }`}>
          
          <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-2xl font-black text-white leading-relaxed tracking-wide text-center">
              {problem.text}
            </h3>
          </div>

          <div className="space-y-6">
            
            {/* Step 1: Extract Variables */}
            <div className={`p-6 rounded-2xl transition-all ${step === 1 ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-black/30 border border-white/5 opacity-50'}`}>
              <h4 className="text-purple-400 font-bold uppercase text-sm mb-4">Paso 1: Extraer datos</h4>
              
              <div className="space-y-3">
                {problem.variables.map((v, index) => (
                  <div key={index} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-lg font-bold text-slate-300">{v.label}</span>
                    <input 
                      type="number"
                      value={varInputs[index] || ''}
                      onChange={(e) => handleVarInputChange(index, e.target.value)}
                      disabled={step > 1 || isGameOver}
                      className="w-24 bg-black/40 border border-white/10 rounded-lg py-2 text-center text-xl font-black text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    />
                  </div>
                ))}
              </div>

              {step === 1 && !isGameOver && (
                <button 
                  onClick={validateStep1}
                  className="mt-6 w-full bg-purple-500 hover:bg-purple-400 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                  Confirmar Datos <ChevronRight size={20} />
                </button>
              )}
            </div>

            {/* Step 2: Solve */}
            <div className={`p-6 rounded-2xl transition-all ${step === 2 ? 'bg-neon-blue/10 border border-neon-blue/30' : 'bg-black/30 border border-white/5 opacity-50'}`}>
              <h4 className="text-neon-blue font-bold uppercase text-sm mb-4">Paso 2: Resolver el problema</h4>
              
              <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                <span className="text-xl font-bold text-slate-300">Respuesta final:</span>
                <input 
                  type="number"
                  value={finalAnswer}
                  onChange={(e) => setFinalAnswer(e.target.value)}
                  disabled={step < 2 || isGameOver}
                  className="w-32 bg-black/40 border border-white/10 rounded-lg py-3 text-center text-3xl font-black text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
                />
              </div>

              {step === 2 && !isGameOver && (
                <button 
                  onClick={validateStep2}
                  className="mt-6 w-full bg-gradient-to-r from-neon-blue to-blue-500 hover:from-blue-400 hover:to-blue-400 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                >
                  <CheckCircle2 size={24} /> Validar Respuesta
                </button>
              )}
            </div>

          </div>

          {/* Game Over Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-fade-in z-20">
              <XCircle size={80} className="text-rose-500 mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
              <h2 className="text-5xl font-black text-white mb-2 tracking-wide">¡Misión Fallida!</h2>
              <p className="text-rose-300 text-xl font-bold mb-8">Un pequeño error de cálculo, cadete.</p>
              
              <div className="glass-panel-light px-8 py-6 rounded-2xl mb-8 flex space-x-12">
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Aciertos</div>
                  <div className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{score}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Tiempo</div>
                  <div className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{timeTaken}s</div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-4 w-full max-w-sm">
                <button 
                  onClick={startNewGame}
                  className="bg-gradient-to-r from-neon-blue to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-black py-5 px-8 rounded-2xl text-xl transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)] transform hover:-translate-y-1"
                >
                  Intentar de nuevo
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all"
                >
                  Volver al cuartel
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
