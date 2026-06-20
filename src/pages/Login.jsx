import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Rocket, User, Sparkles } from 'lucide-react';

const AVATAR_TITLES = {
  '🧑‍🚀': ['Astronauta Novato', 'Explorador Espacial', 'Comandante Estelar'],
  '👽': ['Visitante Galáctico', 'Amigo Marciano', 'Líder Alienígena'],
  '🤖': ['Droide Auxiliar', 'Robot Calculador', 'Mecánico Cósmico'],
  '🚀': ['Piloto Veloz', 'Capitán de Cohete', 'As del Espacio'],
  '🛸': ['Viajero Misterioso', 'Navegante de Ovnis', 'Maestro del Platillo'],
  '⭐': ['Estrella Brillante', 'Destello Cósmico', 'Súper Nova']
};

const AVATARS = Object.keys(AVATAR_TITLES);

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Profile Setup State for new users
  const [showSetup, setShowSetup] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [selectedTitle, setSelectedTitle] = useState(AVATAR_TITLES[AVATARS[0]][0]);

  const handleAvatarChange = (avatar) => {
    setSelectedAvatar(avatar);
    setSelectedTitle(AVATAR_TITLES[avatar][0]); // Reset title when avatar changes
  };

  const handleCheckUser = async (e) => {
    e.preventDefault();
    const cleanName = username.trim().toLowerCase();
    
    if (cleanName.length < 3) {
      setError('¡El nombre debe tener al menos 3 letras!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: player, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .eq('username', cleanName)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (player) {
        onLogin(player);
      } else {
        setShowSetup(true);
      }
    } catch (err) {
      console.error(err);
      setError('¡Fallo de comunicación estelar! Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    setLoading(true);
    setError('');
    const cleanName = username.trim().toLowerCase();

    try {
      const { data: newPlayer, error: insertError } = await supabase
        .from('players')
        .insert([{ 
          username: cleanName, 
          avatar: selectedAvatar, 
          title: selectedTitle 
        }])
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      onLogin(newPlayer);
    } catch (err) {
      console.error(err);
      setError('¡Error al crear el perfil en la nave nodriza!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl w-full max-w-md p-8 text-center relative overflow-hidden pop">
        
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-purple rounded-full blur-[80px] opacity-30"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-blue rounded-full blur-[80px] opacity-30"></div>

        {!showSetup ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="glass-panel-light p-4 rounded-full border border-white/20 shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                <Rocket size={48} className="text-neon-blue" />
              </div>
            </div>
            <h1 className="text-4xl font-black mb-2 text-gradient tracking-tight">Math Kids</h1>
            <p className="text-slate-300 mb-8 font-medium">Identificación de la Flota Estelar</p>
            
            <form onSubmit={handleCheckUser} className="space-y-5 relative z-10">
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de astronauta"
                  className="w-full bg-black/30 border border-white/10 text-white placeholder-slate-400 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue rounded-2xl py-4 pl-12 pr-4 text-lg outline-none transition-all"
                  disabled={loading}
                />
              </div>
              
              {error && <p className="text-rose-400 font-bold text-sm bg-rose-500/10 py-2 rounded-lg">{error}</p>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-neon-blue to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black py-4 px-6 rounded-2xl text-lg shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all disabled:opacity-50"
              >
                {loading ? 'Escaneando...' : 'Entrar en la Nave 🚀'}
              </button>
            </form>
          </>
        ) : (
          <div className="relative z-10 pop">
            <h2 className="text-2xl font-black text-white mb-2">¡Nuevo Tripulante!</h2>
            <p className="text-slate-300 mb-6 text-sm">Personaliza tu placa espacial, <strong className="text-neon-blue capitalize">{username}</strong></p>
            
            <div className="space-y-6 text-left">
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-neon-purple"/> Elige tu Avatar
                </label>
                <div className="flex flex-wrap gap-3 justify-center">
                  {AVATARS.map(avatar => (
                    <button
                      key={avatar}
                      onClick={() => handleAvatarChange(avatar)}
                      className={`text-3xl w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        selectedAvatar === avatar 
                          ? 'bg-neon-purple/20 border-2 border-neon-purple scale-110 shadow-[0_0_15px_rgba(176,38,255,0.4)]' 
                          : 'glass-panel-light hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <Rocket size={16} className="text-neon-blue"/> Elige tu Título
                </label>
                <div className="grid gap-2">
                  {AVATAR_TITLES[selectedAvatar].map(title => (
                    <button
                      key={title}
                      onClick={() => setSelectedTitle(title)}
                      className={`text-sm font-bold py-3 px-4 rounded-xl text-left transition-all ${
                        selectedTitle === title 
                          ? 'bg-neon-blue/20 border border-neon-blue text-white shadow-[0_0_10px_rgba(0,243,255,0.2)]' 
                          : 'glass-panel-light text-slate-300 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-rose-400 font-bold text-sm text-center">{error}</p>}

              <button 
                onClick={handleCreateProfile}
                disabled={loading}
                className="w-full bg-gradient-to-r from-neon-purple to-purple-600 hover:from-purple-500 hover:to-purple-400 text-white font-black py-4 px-6 rounded-2xl text-lg shadow-[0_0_20px_rgba(176,38,255,0.4)] transition-all disabled:opacity-50 mt-4"
              >
                {loading ? 'Creando...' : 'Confirmar Registro ✨'}
              </button>
              
              <button 
                onClick={() => setShowSetup(false)}
                className="w-full py-2 text-slate-400 hover:text-white text-sm font-bold transition-colors"
              >
                Volver
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
