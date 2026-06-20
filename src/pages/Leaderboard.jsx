import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Trophy, Medal, Clock, CheckCircle2, Plus, Minus, X, Divide, HelpCircle, Shapes, Layers } from 'lucide-react';

const TABS = [
  { id: 'somas', label: 'Sumas', icon: <Plus size={16} /> },
  { id: 'subtracoes', label: 'Restas', icon: <Minus size={16} /> },
  { id: 'multiplicacao', label: 'Multiplicación', icon: <X size={16} /> },
  { id: 'divisao', label: 'División', icon: <Divide size={16} /> },
  { id: 'problemas', label: 'Problemas', icon: <HelpCircle size={16} /> },
  { id: 'formas', label: 'Formas', icon: <Shapes size={16} /> },
  { id: 'memoria', label: 'Memoria', icon: <Layers size={16} /> }
];

export default function Leaderboard({ player }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('somas');
  const [activeDifficulty, setActiveDifficulty] = useState('medio');
  const [memoriaLevel, setMemoriaLevel] = useState(10);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScores(activeTab, activeTab === 'memoria' ? memoriaLevel : activeDifficulty);
  }, [activeTab, activeDifficulty, memoriaLevel]);

  const fetchScores = async (gameMode, difficulty) => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('scores')
        .select(`
          id,
          score,
          time_taken,
          players (
            username,
            avatar,
            title
          )
        `)
        .eq('game_mode', `${gameMode}_${difficulty}`)
        .order('score', { ascending: false })
        .order('time_taken', { ascending: true })
        .limit(10);

      if (fetchError) throw fetchError;
      setScores(data);
    } catch (err) {
      console.error('Error fetching scores:', err);
      setError('¡Problema al intentar sintonizar los récords de la galaxia!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-10">
      <div className="glass-panel rounded-3xl w-full max-w-2xl p-6 relative overflow-hidden">
        
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-32 bg-amber-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

        <div className="flex items-center mb-6 relative z-10">
          <button onClick={() => navigate(-1)} className="glass-button p-3 rounded-2xl text-slate-300 hover:text-white mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 flex justify-center items-center space-x-3 mr-14">
            <div className="bg-amber-500/20 p-3 rounded-full border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Trophy size={32} className="text-amber-400" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-wide">Top Astronautas</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-4 relative z-10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-amber-500 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                  : 'glass-panel-light text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="flex justify-center mb-8 relative z-10">
          {activeTab === 'memoria' ? (
            <div className="glass-panel-light p-1 rounded-xl inline-flex shadow-lg flex-wrap justify-center max-w-full">
              {[10, 20, 30].map(level => (
                <button
                  key={level}
                  onClick={() => setMemoriaLevel(level)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all m-0.5 ${
                    memoriaLevel === level 
                      ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {level} CARTAS
                </button>
              ))}
            </div>
          ) : (
            <div className="glass-panel-light p-1 rounded-xl inline-flex shadow-lg">
              <button
                onClick={() => setActiveDifficulty('facil')}
                className={`py-1.5 px-4 rounded-lg text-xs font-black transition-all ${
                  activeDifficulty === 'facil' 
                    ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                FÁCIL
              </button>
              <button
                onClick={() => setActiveDifficulty('medio')}
                className={`py-1.5 px-4 rounded-lg text-xs font-black transition-all ${
                  activeDifficulty === 'medio' 
                    ? 'bg-amber-500 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                MEDIO
              </button>
              <button
                onClick={() => setActiveDifficulty('dificil')}
                className={`py-1.5 px-4 rounded-lg text-xs font-black transition-all ${
                  activeDifficulty === 'dificil' 
                    ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                DIFÍCIL
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500/50 text-rose-300 p-4 rounded-2xl text-center mb-6 font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            {scores.length === 0 ? (
              <div className="glass-panel-light p-10 rounded-2xl text-center">
                <div className="text-5xl mb-4">🚀</div>
                <p className="text-slate-300 text-lg font-medium">El panel está vacío. ¡Sé el primero en dejar tu marca en las estrellas!</p>
              </div>
            ) : (
              scores.map((item, index) => {
                const p = item.players || {};
                const isCurrentPlayer = p.username === player.username;
                let bgClass = "glass-panel-light border-white/5";
                let nameColor = "text-white";
                let medal = null;

                if (index === 0) {
                  bgClass = "bg-amber-500/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]";
                  nameColor = "text-amber-400";
                  medal = <Medal size={28} className="text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />;
                } else if (index === 1) {
                  bgClass = "bg-slate-300/10 border border-slate-300/30";
                  nameColor = "text-slate-300";
                  medal = <Medal size={28} className="text-slate-300 drop-shadow-[0_0_5px_rgba(203,213,225,0.8)]" />;
                } else if (index === 2) {
                  bgClass = "bg-orange-500/10 border border-orange-500/30";
                  nameColor = "text-orange-400";
                  medal = <Medal size={28} className="text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" />;
                }

                return (
                  <div 
                    key={item.id} 
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl transition-all hover:bg-white/10 ${bgClass} ${isCurrentPlayer ? 'ring-2 ring-neon-blue bg-neon-blue/5' : ''}`}
                  >
                    <div className="flex items-center space-x-4 mb-3 sm:mb-0 w-full sm:w-auto">
                      <div className={`font-black text-2xl w-8 text-center flex-shrink-0 text-white/50`}>
                        {medal ? medal : `#${index + 1}`}
                      </div>
                      
                      <div className="text-4xl bg-black/30 w-12 h-12 flex items-center justify-center rounded-xl border border-white/10 flex-shrink-0">
                        {p.avatar || '👽'}
                      </div>
                      
                      <div className="flex flex-col overflow-hidden">
                        <span className={`font-black text-xl capitalize truncate ${nameColor} ${isCurrentPlayer ? 'drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]' : ''}`}>
                          {p.username || 'Astronauta'}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {p.title || 'Explorador Novato'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 sm:space-x-4 flex-shrink-0 self-end sm:self-center w-full sm:w-auto justify-end">
                      <div className="flex flex-col items-center bg-black/40 border border-white/10 px-4 py-2 rounded-xl min-w-[90px]">
                        <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Aciertos</span>
                        <div className="flex items-center space-x-1">
                          <CheckCircle2 size={16} className="text-neon-green" />
                          <span className="font-black text-white text-lg leading-none">{item.score}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center bg-black/40 border border-white/10 px-4 py-2 rounded-xl min-w-[90px]">
                        <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Tiempo</span>
                        <div className="flex items-center space-x-1">
                          <Clock size={16} className="text-neon-blue" />
                          <span className="font-black text-white text-lg leading-none">{item.time_taken || 0}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
