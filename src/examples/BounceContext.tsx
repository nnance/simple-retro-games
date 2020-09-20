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
  bounceEventSystem,
  queueHandler,
  worldFactory,
  useGameControls,
  particleFactory,
  getPosition,
  getRadius,
  IPosition,
  IRadius,
  IMovement,
  ISize,
} from "../lib";
import { useColSize } from "../Layout";

const Ball = () => {
  const [gameState] = useGameContext();

  if (gameState.particles.length) {
    const pos = getPosition(gameState.particles[0]);
    const radius = getRadius(gameState.particles[0]);
    return pos && radius ? (
      <circle
        r={radius.radius}
        cx={pos.pos.x}
        cy={pos.pos.y}
        stroke="grey"
        fill="none"
      />
    ) : null;
  }
  return null;
};

const update = updater([
  movementSystem,
  collisionSystem(bounceEventSystem),
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
      components: [
        { pos: { x: 30, y: 30 } } as IPosition,
        { radius: 20 } as IRadius,
        { velocity: { x: 3, y: 3 } } as IMovement,
      ],
    }),
    particleFactory({
      components: [
        { pos: { x: 0, y: height } } as IPosition,
        { size: { width, height: 10 } } as ISize,
      ],
    }),
    particleFactory({
      components: [
        { pos: { x: width, y: 0 } } as IPosition,
        { size: { width: 10, height } } as ISize,
      ],
    }),
    particleFactory({
      components: [
        { pos: { x: 0, y: -10 } } as IPosition,
        { size: { width, height: 10 } } as ISize,
      ],
    }),
    particleFactory({
      components: [
        { pos: { x: -10, y: 0 } } as IPosition,
        { size: { width: 10, height } } as ISize,
      ],
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
