import React from "react";
import {
  IParticle,
  idFactory,
  movementSystem,
  collisionSystem,
  updater,
  renderer,
  gameLoop,
  circleSystem,
  IRect,
  collisionHandler,
  queueHandler,
  worldFactor,
  gameControls,
  createSystemQueue,
} from "../lib";
import { useColSize } from "../Layout";

const particleFactory = ({ width, height }: IRect): IParticle[] => {
  return [
    {
      id: idFactory(),
      family: "ball",
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

const startGame = (ctx: CanvasRenderingContext2D, size: IRect) => {
  const particles = particleFactory(size);
  const queue = createSystemQueue();

  const update = updater([
    movementSystem,
    collisionSystem(collisionHandler),
    queueHandler,
    renderer(ctx, [circleSystem(ctx)]),
  ]);

  const cancelControls = gameControls({
    pause: () =>
      queue.enqueue((world) => ({ ...world, paused: !world.paused })),
  });

  const cancelLoop = gameLoop(
    update,
    worldFactor({
      paused: true,
      particles,
      queue,
    })
  );

  return () => {
    cancelLoop();
    cancelControls();
  };
};

const Bounce = () => {
  const [size] = useColSize();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      return startGame(ctx, size);
    }
  }, [canvasRef, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ background: "black", width: "100%", height: "100%" }}
      {...size}
    />
  );
};

export default Bounce;
