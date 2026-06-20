import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hash, CheckCircle2, Edit3, RotateCcw } from 'lucide-react';

const ROMAN_GROUPS = {
  '1_10': { 
    id: '1_10',
    title: 'Del 1 al 10', 
    items: [
      { dec: 1, rom: 'I' }, { dec: 2, rom: 'II' }, { dec: 3, rom: 'III' }, { dec: 4, rom: 'IV' }, { dec: 5, rom: 'V' },
      { dec: 6, rom: 'VI' }, { dec: 7, rom: 'VII' }, { dec: 8, rom: 'VIII' }, { dec: 9, rom: 'IX' }, { dec: 10, rom: 'X' }
    ]
  },
  '11_20': { 
    id: '11_20',
    title: 'Del 11 al 20', 
    items: [
      { dec: 11, rom: 'XI' }, { dec: 12, rom: 'XII' }, { dec: 13, rom: 'XIII' }, { dec: 14, rom: 'XIV' }, { dec: 15, rom: 'XV' },
      { dec: 16, rom: 'XVI' }, { dec: 17, rom: 'XVII' }, { dec: 18, rom: 'XVIII' }, { dec: 19, rom: 'XIX' }, { dec: 20, rom: 'XX' }
    ]
  },
  'decenas': { 
    id: 'decenas',
    title: 'Decenas (10 - 100)', 
    items: [
      { dec: 10, rom: 'X' }, { dec: 20, rom: 'XX' }, { dec: 30, rom: 'XXX' }, { dec: 40, rom: 'XL' }, { dec: 50, rom: 'L' },
      { dec: 60, rom: 'LX' }, { dec: 70, rom: 'LXX' }, { dec: 80, rom: 'LXXX' }, { dec: 90, rom: 'XC' }, { dec: 100, rom: 'C' }
    ]
  },
  'centenas': { 
    id: 'centenas',
    title: 'Centenas (100 - 1000)', 
    items: [
      { dec: 100, rom: 'C' }, { dec: 200, rom: 'CC' }, { dec: 300, rom: 'CCC' }, { dec: 400, rom: 'CD' }, { dec: 500, rom: 'D' },
      { dec: 600, rom: 'DC' }, { dec: 700, rom: 'DCC' }, { dec: 800, rom: 'DCCC' }, { dec: 900, rom: 'CM' }, { dec: 1000, rom: 'M' }
    ]
  }
};

export default function Romanos() {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [mode, setMode] = useState('study'); // 'study' or 'test'
  
  // For test mode
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [score, setScore] = useState(0);
  const [testOrder, setTestOrder] = useState([]);

  const handleSelectGroup = (groupId) => {
    setSelectedGroup(ROMAN_GROUPS[groupId]);
    setMode('study');
    setAnswers({});
    setResults(null);
  };

  const startTest = () => {
    setMode('test');
    setAnswers({});
    setResults(null);
    setTestOrder([...selectedGroup.items].sort(() => Math.random() - 0.5));
  };

  const handleInputChange = (roman, value) => {
    setAnswers(prev => ({
      ...prev,
      [roman]: value
    }));
  };

  const checkAnswers = () => {
    const newResults = {};
    let correctCount = 0;

    selectedGroup.items.forEach(item => {
      const isCorrect = parseInt(answers[item.rom]) === item.dec;
      newResults[item.rom] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setResults(newResults);
    setScore(correctCount);
  };

  const renderSelection = () => (
    <div className="w-full max-w-2xl text-center relative z-10 pop">
      <div className="bg-orange-500/20 p-4 rounded-full inline-block border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.3)] mb-6">
        <Hash size={48} className="text-orange-400" />
      </div>
      <h1 className="text-4xl font-black text-white mb-2">Números Romanos</h1>
      <p className="text-slate-300 font-medium mb-10">Elige un grupo para comenzar a estudiar los símbolos antiguos.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
        {Object.values(ROMAN_GROUPS).map(group => (
          <button
            key={group.id}
            onClick={() => handleSelectGroup(group.id)}
            className="glass-panel text-2xl font-black py-8 rounded-3xl transition-all border-white/10 hover:border-orange-400/50 hover:bg-orange-400/10 hover:text-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:-translate-y-1"
          >
            {group.title}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStudyMode = () => (
    <div className="w-full max-w-md relative z-10 pop flex flex-col h-[80vh]">
      <div className="flex items-center mb-6">
        <button onClick={() => setSelectedGroup(null)} className="glass-button p-3 rounded-2xl text-slate-300 hover:text-white mr-4">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-black text-white flex-1 text-center">{selectedGroup.title}</h2>
      </div>

      <div className="glass-panel rounded-3xl p-6 flex-1 overflow-y-auto mb-6 custom-scrollbar">
        <div className="space-y-2">
          {selectedGroup.items.map(item => (
            <div key={item.dec} className="flex justify-center items-center bg-black/20 p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors gap-8">
              <span className="text-3xl font-black text-slate-300 w-16 text-right">{item.dec}</span>
              <span className="text-neon-blue font-black text-xl">=</span>
              <span className="text-4xl font-black text-orange-400 w-24 text-left drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]">
                {item.rom}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={startTest}
        className="w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white font-black py-5 px-6 rounded-2xl text-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all flex justify-center items-center gap-3"
      >
        <Edit3 size={24} /> ¡Poner a prueba!
      </button>
    </div>
  );

  const renderTestMode = () => (
    <div className="w-full max-w-md relative z-10 pop flex flex-col h-[85vh]">
      <div className="flex items-center mb-6">
        <button onClick={() => setMode('study')} className="glass-button p-3 rounded-2xl text-slate-300 hover:text-white mr-4">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-black text-white flex-1 text-center">Prueba: {selectedGroup.title}</h2>
      </div>

      <div className="glass-panel rounded-3xl p-6 flex-1 overflow-y-auto mb-6 custom-scrollbar">
        <div className="space-y-3">
          {testOrder.map(item => {
            const isChecked = results !== null;
            const isCorrect = isChecked ? results[item.rom] : null;
            
            let inputBg = "bg-black/40 border-white/20 focus:border-orange-400 focus:ring-1 focus:ring-orange-400";
            if (isChecked) {
              inputBg = isCorrect 
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                : "bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]";
            }

            return (
              <div key={item.rom} className={`flex justify-between items-center p-3 rounded-2xl border transition-all ${isChecked && !isCorrect ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/5 bg-black/20'}`}>
                <div className="flex items-center flex-1 justify-center sm:justify-start sm:ml-4 gap-4">
                  <span className="text-3xl font-black text-orange-400 w-16 text-right drop-shadow-[0_0_5px_rgba(249,115,22,0.3)]">{item.rom}</span>
                  <span className="text-neon-blue font-black text-xl">=</span>
                </div>
                
                <div className="flex items-center justify-end gap-3 w-32 sm:w-40 relative">
                  <input 
                    type="number" 
                    value={answers[item.rom] || ''}
                    onChange={(e) => handleInputChange(item.rom, e.target.value)}
                    disabled={isChecked}
                    className={`w-16 sm:w-20 text-2xl font-black text-center py-2 rounded-xl outline-none transition-all border text-white ${inputBg}`}
                    placeholder="?"
                  />
                  
                  {/* Correct answer badge on error */}
                  <div className={`w-16 text-left transition-all duration-300 ${isChecked && !isCorrect ? 'opacity-100' : 'opacity-0'}`}>
                    {isChecked && !isCorrect && (
                      <span className="text-emerald-400 font-black text-xl bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        {item.dec}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!results ? (
        <button 
          onClick={checkAnswers}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black py-5 px-6 rounded-2xl text-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex justify-center items-center gap-3"
        >
          <CheckCircle2 size={24} /> Revisar
        </button>
      ) : (
        <div className="space-y-4 pop">
          <div className={`p-4 rounded-2xl border flex items-center justify-between font-black text-xl ${
            score === selectedGroup.items.length 
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
              : score >= selectedGroup.items.length / 2 
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-rose-500/20 border-rose-500 text-rose-400'
          }`}>
            <span>Nota Final:</span>
            <span className="text-3xl">{score} / {selectedGroup.items.length}</span>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={startTest}
              className="flex-1 glass-button text-white font-bold py-4 px-4 rounded-2xl transition-all flex justify-center items-center gap-2"
            >
              <RotateCcw size={20} /> Intentar de nuevo
            </button>
            <button 
              onClick={() => setSelectedGroup(null)}
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 px-4 rounded-2xl transition-all"
            >
              Elegir otro grupo
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      
      {/* Space Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[120px] opacity-10"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-neon-purple rounded-full blur-[120px] opacity-10"></div>
      </div>

      {/* Main Container */}
      {!selectedGroup && renderSelection()}
      {selectedGroup && mode === 'study' && renderStudyMode()}
      {selectedGroup && mode === 'test' && renderTestMode()}

      {/* Global Back Button */}
      {!selectedGroup && (
        <div className="absolute top-6 left-6 z-20">
          <button onClick={() => navigate('/')} className="glass-button p-3 rounded-2xl text-slate-300 hover:text-white flex items-center gap-2 pr-5 font-bold">
            <ArrowLeft size={20} /> Menú
          </button>
        </div>
      )}
    </div>
  );
}
