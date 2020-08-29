import React from "react";
import {
  IRect,
  idFactory,
  IParticle,
  updater,
  movementSystem,
  collisionSystem,
  useAnimationFrame,
  createEventQueue,
} from "../lib";

const GameContext = React.createContext<
  [IParticle[], React.Dispatch<React.SetStateAction<IParticle[]>>]
>([[], () => []]);

const Ball = ({ pos, radius }: IParticle) => {
  return <circle r={radius} cx={pos.x} cy={pos.y} stroke="grey" fill="none" />;
};

const Board = (props: React.PropsWithChildren<IRect>) => {
  const [particles, setParticles] = React.useContext(GameContext);

  const gameLoop = updater([movementSystem, collisionSystem]);

  useAnimationFrame(() => {
    const newWorld = gameLoop({ particles, events: createEventQueue() });
    setParticles(newWorld.particles);
  });

  return (
    <svg
      {...props}
      style={{
        background: "black",
      }}
    >
      <Ball {...particles[0]} />
    </svg>
  );
};

const particleFactory = (): IParticle[] => {
  return [
    {
      id: idFactory(),
      pos: { x: 30, y: 30 },
      radius: 20,
      velocity: { x: 3, y: 3 },
    },
    {
      id: idFactory(),
      pos: { x: 0, y: 600 },
      size: { width: 800, height: 10 },
    },
    {
      id: idFactory(),
      pos: { x: 800, y: 0 },
      size: { width: 10, height: 600 },
    },
    {
      id: idFactory(),
      pos: { x: 0, y: -10 },
      size: { width: 800, height: 10 },
    },
    {
      id: idFactory(),
      pos: { x: -10, y: 0 },
      size: { width: 10, height: 600 },
    },
  ];
};

const Bounce = () => {
  const particlesState = React.useState(particleFactory);

  return (
    <GameContext.Provider value={particlesState}>
      <Board width={800} height={600}></Board>
    </GameContext.Provider>
  );
};

export default Bounce;
