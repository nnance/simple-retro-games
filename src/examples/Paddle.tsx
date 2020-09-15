import React from "react";
import {
  idFactory,
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
  worldFactor,
  hasEntity,
  IEntity,
} from "../lib";
import { useColSize } from "../Layout";
import { GameProvider } from "../lib/state";

const BRICK_SIZE = { width: 60, height: 20 };
const ROWS = 2;
const COLS = 11;

const brickCollisionSystem = (event: IBounceEvent): ISystem => (world) => {
  if (
    event.collider &&
    hasEntity(event.particle) &&
    event.particle.family === "brick"
  ) {
    const particles = world.particles.reduce((prev, particle) => {
      const hit =
        hasEntity(event.particle) &&
        hasEntity(particle) &&
        event.particle.id === particle.id;
      return hit ? prev : [...prev, particle];
    }, [] as IParticle[]);

    return { ...world, particles };
  }
  return world;
};

const particleFactory = ({ width, height }: IRect): IParticle[] => {
  const x = 190;
  const y = 150;

  const bricks = Array.from(Array(ROWS), (_, row) => {
    const { width, height } = BRICK_SIZE;
    return Array.from(Array(COLS), (_, col) => ({
      id: idFactory(),
      family: "brick",
      pos: { x: x + width * col, y: y + row * height },
      size: { width, height },
    }));
  }).flat();

  return [
    {
      id: idFactory(),
      family: "ball",
      pos: { x: 30, y: 100 },
      radius: 5,
      velocity: { x: 3, y: 3 },
    },
    {
      id: idFactory(),
      family: "floor",
      pos: { x: 0, y: height },
      size: { width, height: 10 },
    },
    {
      id: idFactory(),
      family: "rightWall",
      pos: { x: width, y: 0 },
      size: { width: 10, height },
    },
    {
      id: idFactory(),
      family: "top",
      pos: { x: 0, y: -10 },
      size: { width, height: 10 },
    },
    {
      id: idFactory(),
      family: "leftWall",
      pos: { x: -10, y: 0 },
      size: { width: 10, height },
    },
    {
      id: idFactory(),
      family: "paddle",
      pos: { x: 400, y: height - 100 },
      size: { width: 60, height: 10 },
    },
    ...bricks,
  ];
};

const startGame = (ctx: CanvasRenderingContext2D, size: IRect) => {
  const particles = particleFactory(size);
  const queue = createSystemQueue();

  const paddleEvent = (x: number) => () => {
    queue.enqueue((world) => {
      const particles = world.particles.map((particle) =>
        (particle as IEntity).family === "paddle"
          ? { ...particle, velocity: { x, y: 0 } }
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
    worldFactor({ paused: true, particles, queue })
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
