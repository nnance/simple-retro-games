import React from "react";
import {
  IParticle,
  movementSystem,
  collisionSystem,
  updater,
  renderer,
  gameLoop,
  circleSystem,
  IRect,
  bounceEventSystem,
  queueHandler,
  worldFactory,
  gameControls,
  createSystemQueue,
  particleFactory,
  IPosition,
  IRadius,
  IMovement,
  ISize,
} from "../lib";
import { useColSize } from "../Layout";

const particlesFactory = ({ width, height }: IRect): IParticle[] => {
  return [
    particleFactory({
      family: "ball",
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

const startGame = (ctx: CanvasRenderingContext2D, size: IRect) => {
  const particles = particlesFactory(size);
  const queue = createSystemQueue();

  const update = updater([
    movementSystem,
    collisionSystem(bounceEventSystem),
    queueHandler,
    renderer(ctx, [circleSystem]),
  ]);

  const cancelControls = gameControls({
    pause: () =>
      queue.enqueue((world) => ({ ...world, paused: !world.paused })),
  });

  const cancelLoop = gameLoop(
    update,
    worldFactory({
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
