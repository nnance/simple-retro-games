import React from "react";
import {
  IRect,
  IParticle,
  updater,
  movementSystem,
  collisionSystem,
  useAnimationFrame,
  GameProvider,
  useGameContext,
  collisionHandler,
  queueHandler,
  worldFactory,
  useGameControls,
  particleFactory,
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
  collisionSystem(collisionHandler),
  queueHandler,
]);

const Board = (props: React.PropsWithChildren<IRect>) => {
  const [{ queue }, setGameState] = useGameContext();

  const gameLoop = React.useCallback(() => {
    setGameState((state) => {
      const updated = update(state);
      return updated.paused ? { ...state, paused: true } : updated;
    });
  }, [setGameState]);

  useGameControls({
    pause: () =>
      queue.enqueue((world) => ({ ...world, paused: !world.paused })),
  });

  React.useEffect(() => {
    const { width, height } = props;
    setGameState(
      worldFactory({
        paused: true,
        particles: particlesFactory({ width, height }),
      })
    );
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

const particlesFactory = ({ width, height }: IRect): IParticle[] => {
  return [
    particleFactory({
      pos: { x: 30, y: 30 },
      radius: 20,
      velocity: { x: 3, y: 3 },
    }),
    particleFactory({
      pos: { x: 0, y: height },
      size: { width, height: 10 },
    }),
    particleFactory({
      pos: { x: width, y: 0 },
      size: { width: 10, height },
    }),
    particleFactory({
      pos: { x: 0, y: -10 },
      size: { width, height: 10 },
    }),
    particleFactory({
      pos: { x: -10, y: 0 },
      size: { width: 10, height },
    }),
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
