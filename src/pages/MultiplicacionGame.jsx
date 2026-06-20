import MathGame from '../components/MathGame';

export default function MultiplicacionGame({ player, difficulty }) {
  return <MathGame player={player} difficulty={difficulty} gameMode="multiplicacao" title="Multiplicación" operatorChar="×" />;
}
