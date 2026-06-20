import { useNavigate } from 'react-router-dom';
import { LogOut, Trophy, Plus, Minus, X, Divide, HelpCircle, Shapes, Hash, Layers, BookOpen } from 'lucide-react';

export default function Home({ player, onLogout, difficulty, setDifficulty }) {
  const navigate = useNavigate();

  const games = [
    { id: 'tablas', name: 'Tablas de Multiplicar', icon: <BookOpen size={32} />, color: 'bg-violet-500 hover:bg-violet-400', shadow: 'shadow-[0_0_15px_rgba(139,92,246,0.5)]', available: true },
    { id: 'somas', name: 'Sumas', icon: <Plus size={32} />, color: 'bg-emerald-500 hover:bg-emerald-400', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]', available: true },
    { id: 'subtracoes', name: 'Restas', icon: <Minus size={32} />, color: 'bg-rose-500 hover:bg-rose-400', shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.5)]', available: true },
    { id: 'multiplicacao', name: 'Multiplicación', icon: <X size={32} />, color: 'bg-amber-500 hover:bg-amber-400', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]', available: true },
    { id: 'divisao', name: 'División', icon: <Divide size={32} />, color: 'bg-blue-500 hover:bg-blue-400', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]', available: true },
    { id: 'romanos', name: 'Números Romanos', icon: <Hash size={32} />, color: 'bg-orange-500 hover:bg-orange-400', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]', available: true },
    { id: 'problemas', name: 'Problemas', icon: <HelpCircle size={32} />, color: 'bg-purple-500 hover:bg-purple-400', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]', available: true },
    { id: 'formas', name: 'Formas', icon: <Shapes size={32} />, color: 'bg-pink-500 hover:bg-pink-400', shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.5)]', available: true },
    { id: 'memoria', name: 'Memoria', icon: <Layers size={32} />, color: 'bg-indigo-500 hover:bg-indigo-400', shadow: 'shadow-[0_0_15px_rgba(99,102,241,0.5)]', available: true },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue rounded-full blur-[150px] opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple rounded-full blur-[150px] opacity-20"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10 glass-panel p-6 rounded-3xl">
          <div className="flex items-center space-x-4">
            <div className="text-4xl bg-black/30 w-16 h-16 flex items-center justify-center rounded-2xl border border-white/10 shadow-inner">
              {player.avatar || '👽'}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white capitalize drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                {player.username}
              </h1>
              <p className="text-neon-blue font-bold tracking-widest text-sm uppercase">
                {player.title || 'Explorador Novato'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/ranking')}
              className="glass-button text-amber-400 font-bold py-3 px-5 rounded-2xl flex items-center transition-all hover:bg-amber-400/20"
            >
              <Trophy size={20} className="mr-2" />
              Ranking
            </button>
            <button 
              onClick={onLogout}
              className="glass-button text-rose-400 p-3 rounded-2xl hover:bg-rose-500/20 transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="glass-panel-light p-2 rounded-2xl inline-flex mb-8 mx-auto w-full max-w-md shadow-lg relative left-1/2 -translate-x-1/2">
          <button
            onClick={() => setDifficulty('facil')}
            className={`flex-1 py-3 px-4 rounded-xl font-black transition-all ${
              difficulty === 'facil' 
                ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            FÁCIL 🟢
          </button>
          <button
            onClick={() => setDifficulty('medio')}
            className={`flex-1 py-3 px-4 rounded-xl font-black transition-all ${
              difficulty === 'medio' 
                ? 'bg-amber-500 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MEDIO 🟡
          </button>
          <button
            onClick={() => setDifficulty('dificil')}
            className={`flex-1 py-3 px-4 rounded-xl font-black transition-all ${
              difficulty === 'dificil' 
                ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            DIFÍCIL 🔴
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => game.available && navigate(`/${game.id}`)}
              className={`relative p-6 rounded-3xl transition-all flex flex-col items-center justify-center text-white border border-white/10 ${
                game.available 
                  ? `${game.color} ${game.shadow} hover:-translate-y-2 cursor-pointer` 
                  : 'glass-panel opacity-50 cursor-not-allowed saturate-0'
              }`}
            >
              <div className="mb-4 bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                {game.icon}
              </div>
              <span className="font-bold text-lg text-center leading-tight">{game.name}</span>
              
              {!game.available && (
                <div className="absolute inset-0 bg-space-900/40 rounded-3xl flex items-center justify-center backdrop-blur-[2px]">
                  <span className="bg-white/10 border border-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg transform -rotate-12 backdrop-blur-md">Próximamente</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
