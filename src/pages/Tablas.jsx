import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, Edit3, RotateCcw } from 'lucide-react';

export default function Tablas() {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState(null);
  const [mode, setMode] = useState('study'); // 'study' or 'test'
  
  // For test mode
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [score, setScore] = useState(0);
  const [testOrder, setTestOrder] = useState([]);

  const multipliers = Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12

  const handleSelectTable = (num) => {
    setSelectedTable(num);
    setMode('study');
    setAnswers({});
    setResults(null);
  };

  const startTest = () => {
    setMode('test');
    setAnswers({});
    setResults(null);
    setTestOrder([...multipliers].sort(() => Math.random() - 0.5));
  };

  const handleInputChange = (multiplier, value) => {
    setAnswers(prev => ({
      ...prev,
      [multiplier]: value
    }));
  };

  const checkAnswers = () => {
    const newResults = {};
    let correctCount = 0;

    multipliers.forEach(m => {
      const isCorrect = parseInt(answers[m]) === selectedTable * m;
      newResults[m] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setResults(newResults);
    setScore(correctCount);
  };

  const renderSelection = () => (
    <div className="w-full max-w-2xl text-center relative z-10 pop">
      <div className="bg-amber-500/20 p-4 rounded-full inline-block border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)] mb-6">
        <BookOpen size={48} className="text-amber-400" />
      </div>
      <h1 className="text-4xl font-black text-white mb-2">Tablas de Multiplicar</h1>
      <p className="text-slate-300 font-medium mb-10">Elige un número del 1 al 12 para comenzar a estudiar.</p>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {multipliers.map(num => (
          <button
            key={num}
            onClick={() => handleSelectTable(num)}
            className="glass-panel text-3xl font-black py-6 rounded-3xl transition-all border-white/10 hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-1"
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStudyMode = () => (
    <div className="w-full max-w-md relative z-10 pop flex flex-col h-[80vh]">
      <div className="flex items-center mb-6">
        <button onClick={() => setSelectedTable(null)} className="glass-button p-3 rounded-2xl text-slate-300 hover:text-white mr-4">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-black text-white flex-1 text-center">Tabla del {selectedTable}</h2>
      </div>

      <div className="glass-panel rounded-3xl p-6 flex-1 overflow-y-auto mb-6 custom-scrollbar">
        <div className="space-y-2">
          {multipliers.map(m => (
            <div key={m} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
              <span className="text-2xl font-bold text-slate-300 w-12 text-right">{selectedTable}</span>
              <span className="text-neon-blue font-black text-xl mx-4">×</span>
              <span className="text-2xl font-bold text-slate-300 w-12 text-left">{m}</span>
              <span className="text-amber-400 font-black text-2xl mx-4">=</span>
              <span className="text-3xl font-black text-white w-16 text-right drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                {selectedTable * m}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={startTest}
        className="w-full bg-gradient-to-r from-neon-blue to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black py-5 px-6 rounded-2xl text-xl shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all flex justify-center items-center gap-3"
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
        <h2 className="text-2xl font-black text-white flex-1 text-center">Prueba: Tabla del {selectedTable}</h2>
      </div>

      <div className="glass-panel rounded-3xl p-6 flex-1 overflow-y-auto mb-6 custom-scrollbar">
        <div className="space-y-3">
          {testOrder.map(m => {
            const isChecked = results !== null;
            const isCorrect = isChecked ? results[m] : null;
            
            let inputBg = "bg-black/40 border-white/20 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue";
            if (isChecked) {
              inputBg = isCorrect 
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                : "bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]";
            }

            return (
              <div key={m} className={`flex justify-between items-center p-3 rounded-2xl border transition-all ${isChecked && !isCorrect ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/5 bg-black/20'}`}>
                <div className="flex items-center flex-1 justify-center sm:justify-start sm:ml-4">
                  <span className="text-2xl font-bold text-slate-300 w-10 text-right">{selectedTable}</span>
                  <span className="text-neon-blue font-black text-xl mx-3">×</span>
                  <span className="text-2xl font-bold text-slate-300 w-10 text-left">{m}</span>
                  <span className="text-amber-400 font-black text-2xl mx-3">=</span>
                </div>
                
                <div className="flex items-center justify-end gap-3 w-32 sm:w-40 relative">
                  <input 
                    type="number" 
                    value={answers[m] || ''}
                    onChange={(e) => handleInputChange(m, e.target.value)}
                    disabled={isChecked}
                    className={`w-16 sm:w-20 text-2xl font-black text-center py-2 rounded-xl outline-none transition-all border text-white ${inputBg}`}
                    placeholder="?"
                  />
                  
                  {/* Mostrar respuesta correcta si hay error */}
                  <div className={`w-12 text-left transition-all duration-300 ${isChecked && !isCorrect ? 'opacity-100' : 'opacity-0'}`}>
                    {isChecked && !isCorrect && (
                      <span className="text-emerald-400 font-black text-xl bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        {selectedTable * m}
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
            score === 12 
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
              : score >= 6 
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-rose-500/20 border-rose-500 text-rose-400'
          }`}>
            <span>Nota Final:</span>
            <span className="text-3xl">{score} / 12</span>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={startTest}
              className="flex-1 glass-button text-white font-bold py-4 px-4 rounded-2xl transition-all flex justify-center items-center gap-2"
            >
              <RotateCcw size={20} /> Intentar de nuevo
            </button>
            <button 
              onClick={() => setSelectedTable(null)}
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 px-4 rounded-2xl transition-all"
            >
              Elegir otra tabla
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[120px] opacity-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue rounded-full blur-[120px] opacity-10"></div>
      </div>

      {/* Main Container */}
      {!selectedTable && renderSelection()}
      {selectedTable && mode === 'study' && renderStudyMode()}
      {selectedTable && mode === 'test' && renderTestMode()}

      {/* Global Back Button */}
      {!selectedTable && (
        <div className="absolute top-6 left-6 z-20">
          <button onClick={() => navigate('/')} className="glass-button p-3 rounded-2xl text-slate-300 hover:text-white flex items-center gap-2 pr-5 font-bold">
            <ArrowLeft size={20} /> Menú
          </button>
        </div>
      )}
    </div>
  );
}
