import React from "react";
import {
  IParticle,
  updater,
  movementSystem,
  collisionSystem,
  renderer,
  circleSystem,
  gameLoop,
  rectangleSystem,
  gameControls,
  bounceEventSystem,
  IRect,
  createSystemQueue,
  queueHandler,
  CollisionHandler,
  IBounceEvent,
  ISystem,
  worldFactory,
  particleFactory,
  IPosition,
  ISize,
  IRadius,
  IMovement,
  isMovement,
  getMovement,
} from "../lib";
import { useColSize } from "../Layout";
import { GameProvider } from "../lib/state";

const BRICK_SIZE = { width: 60, height: 20 };
const ROWS = 2;
const COLS = 11;

const brickCollisionSystem = (event: IBounceEvent): ISystem => (world) => {
  if (event.collider && event.particle.family === "brick") {
    const particles = world.particles.reduce((prev, particle) => {
      const hit = event.particle.id === particle.id;
      return hit ? prev : [...prev, particle];
    }, [] as IParticle[]);

    return { ...world, particles };
  }
  return world;
};

const particlesFactory = ({ width, height }: IRect): IParticle[] => {
  const x = 190;
  const y = 150;

  const bricks = Array.from(Array(ROWS), (_, row) => {
    const { width, height } = BRICK_SIZE;
    return Array.from(Array(COLS), (_, col) =>
      particleFactory({
        family: "brick",
        components: [
          { pos: { x: x + width * col, y: y + row * height } } as IPosition,
          { size: { width, height } } as ISize,
        ],
      })
    );
  }).flat();

  return [
    particleFactory({
      family: "ball",
      components: [
        { pos: { x: 30, y: 100 } } as IPosition,
        { radius: 5 } as IRadius,
        { velocity: { x: 3, y: 3 } } as IMovement,
      ],
    }),
    particleFactory({
      family: "floor",
      components: [
        { pos: { x: 0, y: height } } as IPosition,
        { size: { width, height: 10 } } as ISize,
      ],
    }),
    particleFactory({
      family: "rightWall",
      components: [
        { pos: { x: width, y: 0 } } as IPosition,
        { size: { width: 10, height } } as ISize,
      ],
    }),
    particleFactory({
      family: "top",
      components: [
        { pos: { x: 0, y: -10 } } as IPosition,
        { size: { width, height: 10 } } as ISize,
      ],
    }),
    particleFactory({
      family: "leftWall",
      components: [
        { pos: { x: -10, y: 0 } } as IPosition,
        { size: { width: 10, height } } as ISize,
      ],
    }),
    particleFactory({
      family: "paddle",
      components: [
        { pos: { x: 400, y: height - 100 } } as IPosition,
        { size: { width: 60, height: 10 } } as ISize,
      ],
    }),
    ...bricks,
  ];
};

const startGame = (ctx: CanvasRenderingContext2D, size: IRect) => {
  const particles = particlesFactory(size);
  const queue = createSystemQueue();

  const paddleEvent = (x: number) => () => {
    queue.enqueue((world) => {
      const particles = world.particles.map((particle) =>
        particle.family === "paddle"
          ? {
              ...particle,
              components: getMovement(particle)
                ? particle.components.map((comp) => {
                    return isMovement(comp)
                      ? ({ velocity: { x, y: 0 } } as IMovement)
                      : comp;
                  })
                : [
                    ...particle.components,
                    { velocity: { x, y: 0 } } as IMovement,
                  ],
            }
          : particle
      );

      return { ...world, particles };
    });
  };

  const cancelControls = gameControls({
    rightArrow: paddleEvent(7),
    leftArrow: paddleEvent(-7),
    keyUp: paddleEvent(0),
    pause: () =>
      queue.enqueue((world) => ({ ...world, paused: !world.paused })),
  });

  const collisionHandler: CollisionHandler = (event) => (world) => {
    const bounceUpdate = bounceEventSystem(event)(world);
    return brickCollisionSystem(event)(bounceUpdate);
  };

  const update = updater([
    movementSystem,
    collisionSystem(collisionHandler),
    queueHandler,
    renderer(ctx, [circleSystem, rectangleSystem]),
  ]);

  const cancelLoop = gameLoop(
    update,
    worldFactory({ paused: true, particles, queue })
  );

  return () => {
    cancelControls();
    cancelLoop();
  };
};

const GameBoard = () => {
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

const Bricks = () => {
  return (
    <GameProvider>
      <GameBoard />
    </GameProvider>
  );
};

export default Bricks;
