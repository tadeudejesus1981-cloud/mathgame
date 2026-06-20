import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Clock, Users, Play, Star, Sparkles, Trophy, Settings2 } from 'lucide-react';

const EMOJIS = {
  animales: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋'],
  espacio: ['🚀', '🛸', '👽', '🪐', '🌙', '👾', '☀️', '🌟', '👨‍🚀', '☄️', '🔭', '🌍', '⚡', '🛰', '🌌', '🌠', '🌛', '🌜', '👩‍🚀', '🌎', '🌏', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '✨'],
  numeros: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30']
};

export default function MemoriaGame({ player, difficulty }) {
  const navigate = useNavigate();
  
  // Phase: 'menu' | 'preview' | 'playing' | 'level_complete' | 'game_over'
  const [phase, setPhase] = useState('menu');
  
  // Settings
  const [theme, setTheme] = useState('animales');
  const [numPlayers, setNumPlayers] = useState(1);
  const [startingCards, setStartingCards] = useState(10);
  
  // Game State
  const [currentCardsTotal, setCurrentCardsTotal] = useState(10);
  const [cards, setCards] = useState([]);
  const [playersState, setPlayersState] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [previewTimer, setPreviewTimer] = useState(5);
  const [globalTime, setGlobalTime] = useState(0);
  
  const [toast, setToast] = useState({ show: false, message: '', success: true });
  
  const globalTimerRef = useRef(null);
  const previewTimerRef = useRef(null);

  // -------------------------------------------------------------
  // GAME SETUP
  // -------------------------------------------------------------
  const initGame = () => {
    // Initialize Players
    const newPlayers = [];
    for (let i = 0; i < numPlayers; i++) {
      newPlayers.push({
        id: i,
        name: numPlayers === 1 ? player.username : `Jugador ${i + 1}`,
        score: 0
      });
    }
    setPlayersState(newPlayers);
    setCurrentPlayerIndex(0);
    setCurrentCardsTotal(startingCards);
    setGlobalTime(0);
    
    startLevel(startingCards);
    
    clearInterval(globalTimerRef.current);
    if (numPlayers === 1) {
      globalTimerRef.current = setInterval(() => {
        setGlobalTime(prev => prev + 1);
      }, 1000);
    }
  };

  const startLevel = (numCards) => {
    const numPairs = numCards / 2;
    const pool = EMOJIS[theme].slice(0, numPairs);
    
    const deck = [...pool, ...pool].map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: true, // Face up for preview
      isMatched: false
    })).sort(() => Math.random() - 0.5);

    // Ensure completely new array references for re-renders
    setCards(deck.map((c, i) => ({ ...c, id: i })));
    setFlippedIndices([]);
    setPhase('preview');
    setPreviewTimer(5);

    clearInterval(previewTimerRef.current);
    previewTimerRef.current = setInterval(() => {
      setPreviewTimer(prev => {
        if (prev <= 1) {
          clearInterval(previewTimerRef.current);
          endPreview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endPreview = () => {
    setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
    setPhase('playing');
  };

  // -------------------------------------------------------------
  // GAMEPLAY
  // -------------------------------------------------------------
  const handleCardClick = (index) => {
    if (phase !== 'playing') return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length >= 2) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    
    setCards(prev => {
      const copy = [...prev];
      copy[index].isFlipped = true;
      return copy;
    });

    if (newFlipped.length === 2) {
      checkMatch(newFlipped);
    }
  };

  const checkMatch = (indices) => {
    const [idx1, idx2] = indices;
    const card1 = cards[idx1];
    const card2 = cards[idx2];

    if (card1.emoji === card2.emoji) {
      // MATCH!
      setTimeout(() => {
        setCards(prev => {
          const copy = [...prev];
          copy[idx1].isMatched = true;
          copy[idx2].isMatched = true;
          return copy;
        });
        
        // Update score
        setPlayersState(prev => {
          const copy = [...prev];
          copy[currentPlayerIndex] = {
            ...copy[currentPlayerIndex],
            score: copy[currentPlayerIndex].score + 1
          };
          return copy;
        });
        
        setFlippedIndices([]);
        checkLevelComplete();
      }, 500);
      
    } else {
      // NO MATCH
      setTimeout(() => {
        setCards(prev => {
          const copy = [...prev];
          copy[idx1].isFlipped = false;
          copy[idx2].isFlipped = false;
          return copy;
        });
        setFlippedIndices([]);
        
        // Next Player
        if (numPlayers > 1) {
          setCurrentPlayerIndex((prev) => (prev + 1) % numPlayers);
          showToast(`Turno del ${playersState[(currentPlayerIndex + 1) % numPlayers].name}`, true);
        }
      }, 1000);
    }
  };

  const checkLevelComplete = () => {
    // We check against cards state, but since state updates are async, 
    // we just check if all OTHER cards are matched, plus the 2 we just matched.
    setCards(prev => {
      const allMatched = prev.every(c => c.isMatched);
      if (allMatched) {
        setPhase('level_complete');
      }
      return prev;
    });
  };

  const handleNextLevel = () => {
    const nextTotal = currentCardsTotal + 10;
    setCurrentCardsTotal(nextTotal);
    startLevel(nextTotal);
  };

  const handleFinishGame = () => {
    setPhase('game_over');
    clearInterval(globalTimerRef.current);
    if (numPlayers === 1) {
      saveScoreToDB();
    }
  };

  const saveScoreToDB = async () => {
    try {
      await supabase.from('scores').insert([
        { 
          player_id: player.id, 
          game_mode: `memoria_${currentCardsTotal}`, 
          score: playersState[0].score, 
          time_taken: globalTime 
        }
      ]);
    } catch (err) {
      console.error('Error saving memory score:', err);
    }
  };

  const showToast = (message, success) => {
    setToast({ show: true, message, success });
    setTimeout(() => setToast({ show: false, message: '', success: true }), 2000);
  };

  // -------------------------------------------------------------
  // RENDERING
  // -------------------------------------------------------------

  if (phase === 'menu') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-panel rounded-3xl w-full max-w-xl p-8 border-t-4 border-indigo-500 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate('/')} className="glass-button p-3 rounded-2xl text-slate-300 hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">Juego de Memoria</h2>
            <div className="w-10"></div>
          </div>

          <div className="space-y-8">
            {/* Tema */}
            <div>
              <h3 className="text-indigo-400 font-bold uppercase text-sm mb-3">1. Elige tu Tema</h3>
              <div className="grid grid-cols-3 gap-3">
                {[{ id: 'animales', label: 'Animales', icon: '🦁' }, { id: 'espacio', label: 'Espacio', icon: '🚀' }, { id: 'numeros', label: 'Números', icon: '1️⃣' }].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center ${theme === t.id ? 'bg-indigo-500/30 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}
                  >
                    <span className="text-3xl mb-2">{t.icon}</span>
                    <span className="text-white font-bold text-xs">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Jogadores */}
            <div>
              <h3 className="text-indigo-400 font-bold uppercase text-sm mb-3">2. Cantidad de Jugadores</h3>
              <div className="flex space-x-3">
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumPlayers(n)}
                    className={`flex-1 py-3 rounded-xl border transition-all font-black text-lg ${numPlayers === n ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-black/20 border-white/10 text-slate-400 hover:text-white'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {numPlayers === 1 && <p className="text-xs text-slate-400 mt-2 text-center">Modo Contrarreloj: ¡El tiempo se registrará en el Ranking Global!</p>}
              {numPlayers > 1 && <p className="text-xs text-emerald-400 mt-2 text-center">Modo Competitivo: ¡Quien encuentre más pares, gana!</p>}
            </div>

            {/* Cartas Iniciais */}
            <div>
              <h3 className="text-indigo-400 font-bold uppercase text-sm mb-3">3. Cartas Iniciales</h3>
              <div className="grid grid-cols-3 gap-3">
                {[10, 20, 30].map(c => (
                  <button
                    key={c}
                    onClick={() => setStartingCards(c)}
                    className={`py-3 rounded-xl border transition-all font-black text-lg ${startingCards === c ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-black/20 border-white/10 text-slate-400 hover:text-white'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={initGame}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-xl shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all"
            >
              <Play fill="currentColor" /> INICIAR JUEGO
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Grid Layout
  const getGridCols = () => {
    if (currentCardsTotal <= 10) return 'grid-cols-5 sm:grid-cols-5';
    if (currentCardsTotal <= 20) return 'grid-cols-4 sm:grid-cols-5';
    return 'grid-cols-5 sm:grid-cols-6'; // for 30
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-8 max-w-6xl mx-auto">
      
      {/* Header during gameplay */}
      <div className="glass-panel p-4 rounded-3xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <button onClick={() => { clearInterval(globalTimerRef.current); setPhase('menu'); }} className="glass-button p-3 rounded-2xl text-slate-300 hover:text-white shrink-0">
            <ArrowLeft size={20} />
          </button>
          {numPlayers === 1 ? (
            <div className="glass-panel-light px-6 py-2 rounded-2xl flex items-center space-x-2 text-white font-black">
              <Clock className="text-neon-blue" />
              <span>{globalTime}s</span>
            </div>
          ) : (
            <div className="bg-indigo-500/20 border border-indigo-500/50 px-6 py-2 rounded-2xl text-indigo-300 font-black animate-pulse-slow">
              Turno: {playersState[currentPlayerIndex]?.name}
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {playersState.map((p, i) => (
            <div key={p.id} className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${i === currentPlayerIndex ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400' : 'bg-black/20 border border-white/5 text-slate-400'}`}>
              <Users size={16} />
              <span className="font-bold text-sm">{p.name}: <span className="text-white text-lg font-black">{p.score}</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Level Info & Finish Button */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="text-white font-black text-xl flex items-center gap-2">
          <Star className="text-amber-400" /> Nivel: {currentCardsTotal} Cartas
        </h3>
        <button 
          onClick={handleFinishGame}
          className="text-xs font-bold text-slate-400 hover:text-rose-400 uppercase tracking-widest transition-colors"
        >
          Terminar Ahora 🚩
        </button>
      </div>

      {/* GAME GRID */}
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[400px]">
        
        {phase === 'preview' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-3xl animate-fade-in">
            <div className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 animate-pulse pop">
              {previewTimer}
            </div>
          </div>
        )}

        <div className={`grid ${getGridCols()} gap-2 sm:gap-3 w-full`}>
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={phase !== 'playing' || card.isFlipped || card.isMatched}
              className={`relative aspect-square w-full rounded-xl sm:rounded-2xl transition-all duration-500 transform preserve-3d ${
                !card.isFlipped ? 'rotate-y-180' : ''
              } ${card.isMatched ? 'opacity-30 scale-95' : 'hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]'}`}
              style={{ perspective: '1000px' }}
            >
              {/* Card Front (Faceup) */}
              <div className="absolute inset-0 backface-hidden bg-white rounded-xl sm:rounded-2xl border-2 border-indigo-400 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                <span className="text-4xl sm:text-5xl filter drop-shadow-md">{card.emoji}</span>
              </div>

              {/* Card Back (Facedown) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-xl sm:rounded-2xl border-2 border-white/20 flex items-center justify-center shadow-lg">
                <Sparkles className="text-white/30" size={24} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-8 py-3 rounded-2xl font-black text-white transition-all duration-300 pointer-events-none z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/20 backdrop-blur-md ${toast.success ? 'bg-indigo-500/90' : 'bg-rose-500/90'} ${toast.show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-90'}`}>
        {toast.message}
      </div>

      {/* MODALS */}
      {(phase === 'level_complete' || phase === 'game_over') && (
        <div className="absolute inset-0 z-50 modal-overlay bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-light border border-white/20 p-8 rounded-3xl text-center w-full max-w-md pop shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            
            <div className="w-24 h-24 bg-amber-500/20 border-2 border-amber-500/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Trophy size={48} className="text-amber-400" />
            </div>
            
            <h2 className="text-4xl font-black text-white mb-2">
              {phase === 'game_over' ? '¡FIN DEL JUEGO!' : '¡NIVEL COMPLETADO!'}
            </h2>
            
            {phase === 'game_over' && numPlayers > 1 && (
              <div className="text-2xl font-bold text-emerald-400 mb-6 uppercase tracking-wider">
                🏆 Ganador: {[...playersState].sort((a,b)=>b.score - a.score)[0].name}
              </div>
            )}

            <div className="bg-black/30 rounded-2xl p-4 mb-8">
              {playersState.map(p => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                  <span className="text-slate-300 font-bold">{p.name}</span>
                  <span className="text-white font-black text-xl">{p.score} pares</span>
                </div>
              ))}
              {numPlayers === 1 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <span className="text-slate-400 text-sm font-bold uppercase">Tiempo Total:</span>
                  <div className="text-neon-blue font-black text-3xl">{globalTime}s</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {phase === 'level_complete' && currentCardsTotal < 30 && (
                <button 
                  onClick={handleNextLevel}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black py-4 rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all"
                >
                  Siguiente Nivel (+10 Cartas) 🚀
                </button>
              )}
              
              <button 
                onClick={() => setPhase('menu')}
                className="w-full glass-button text-white font-bold py-4 rounded-2xl transition-all"
              >
                Volver al Menú de Memoria
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
