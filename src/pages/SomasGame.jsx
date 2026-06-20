import MathGame from '../components/MathGame';

export default function SomasGame({ player, difficulty }) {
  return <MathGame player={player} difficulty={difficulty} gameMode="somas" title="Sumas" operatorChar="+" />;
}
