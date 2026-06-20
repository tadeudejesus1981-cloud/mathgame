import MathGame from '../components/MathGame';

export default function DivisionGame({ player, difficulty }) {
  return <MathGame player={player} difficulty={difficulty} gameMode="divisao" title="División" operatorChar="÷" />;
}
