import React from "react";
import {
  IRect,
  idFactory,
  IParticle,
  updater,
  movementSystem,
  collisionSystem,
  useAnimationFrame,
  eventHandler,
  bounceEventSystem,
  GameProvider,
  useGameContext,
} from "../lib";
import { useColSize } from "../Layout";

const Ball = ({ pos, radius }: IParticle) => {
  return <circle r={radius} cx={pos.x} cy={pos.y} stroke="grey" fill="none" />;
};

const Board = (props: React.PropsWithChildren<IRect>) => {
  const [gameState, setGameState] = useGameContext();

  const update = updater([
    movementSystem,
    collisionSystem,
    eventHandler([bounceEventSystem]),
  ]);

  const gameLoop = React.useCallback(() => {
    const newWorld = update(gameState);
    setGameState(newWorld);
  }, [gameState, setGameState, update]);

  useAnimationFrame(gameLoop);

  return (
    <svg
      {...props}
      style={{
        background: "black",
      }}
    >
      <Ball {...gameState.particles[0]} />
    </svg>
  );
};

const particleFactory = ({ width, height }: IRect): IParticle[] => {
  return [
    {
      id: idFactory(),
      pos: { x: 30, y: 30 },
      radius: 20,
      velocity: { x: 3, y: 3 },
    },
    {
      id: idFactory(),
      pos: { x: 0, y: height },
      size: { width, height: 10 },
    },
    {
      id: idFactory(),
      pos: { x: width, y: 0 },
      size: { width: 10, height },
    },
    {
      id: idFactory(),
      pos: { x: 0, y: -10 },
      size: { width, height: 10 },
    },
    {
      id: idFactory(),
      pos: { x: -10, y: 0 },
      size: { width: 10, height },
    },
  ];
};

const Bounce = () => {
  const [size] = useColSize();
  const state = { particles: particleFactory(size) };

  return (
    <GameProvider {...state}>
      <Board {...size}></Board>
    </GameProvider>
  );
};

export default Bounce;
