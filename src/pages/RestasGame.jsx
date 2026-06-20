import MathGame from '../components/MathGame';

export default function RestasGame({ player, difficulty }) {
  return <MathGame player={player} difficulty={difficulty} gameMode="subtracoes" title="Restas" operatorChar="-" />;
}
