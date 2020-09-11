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
  createEventQueue,
} from "../lib";
import { useColSize } from "../Layout";

const Ball = () => {
  const [gameState] = useGameContext();

  if (gameState.particles.length) {
    const { pos, radius } = gameState.particles[0];
    return (
      <circle r={radius} cx={pos.x} cy={pos.y} stroke="grey" fill="none" />
    );
  }
  return null;
};

const update = updater([
  movementSystem,
  collisionSystem,
  eventHandler([bounceEventSystem]),
]);

const Board = (props: React.PropsWithChildren<IRect>) => {
  const [, setGameState] = useGameContext();

  const gameLoop = React.useCallback(() => {
    setGameState((state) => update(state));
  }, [setGameState]);

  React.useEffect(() => {
    const { width, height } = props;
    setGameState({
      paused: false,
      particles: particleFactory({ width, height }),
      events: createEventQueue(),
    });
  }, [props, setGameState]);

  useAnimationFrame(gameLoop);

  return (
    <svg
      {...props}
      style={{ background: "black", width: "100%", height: "100%" }}
      viewBox={`0 0 ${props.width} ${props.height}`}
    >
      <Ball />
    </svg>
  );
};

const particleFactory = ({ width, height }: IRect): IParticle[] => {
  console.dir({ width, height });
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

  return (
    <GameProvider>
      <Board {...size} />
    </GameProvider>
  );
};

export default Bounce;
