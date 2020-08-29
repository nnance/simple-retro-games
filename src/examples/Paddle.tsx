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
  velocityEventSystem,
  IEventSystem,
  createEventQueue,
  eventHandler,
} from "../lib";

const brickSize = { width: 60, height: 20 };
const rows = 2;
const cols = 7;

const brickCollisionSystem: IEventSystem = (event, world) => {
  if (event.collider && event.particle.family === "brick") {
    const particles = world.particles.reduce((prev, particle) => {
      const hit = event.particle.id === particle.id;
      return hit ? prev : [...prev, particle];
    }, [] as IParticle[]);

    return { ...world, particles };
  }
  return world;
};

const particleFactory = (): IParticle[] => {
  const { width, height } = brickSize;
  const x = 190;
  const y = 150;

  const bricks = Array.from(Array(rows), (_, row) =>
    Array.from(Array(cols), (_, col) => ({
      id: idFactory(),
      family: "brick",
      pos: { x: x + width * col, y: y + row * height },
      size: { width, height },
    }))
  ).flat();

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
      pos: { x: 0, y: 600 },
      size: { width: 800, height: 10 },
    },
    {
      id: idFactory(),
      family: "rightWall",
      pos: { x: 800, y: 0 },
      size: { width: 10, height: 600 },
    },
    {
      id: idFactory(),
      family: "top",
      pos: { x: 0, y: -10 },
      size: { width: 800, height: 10 },
    },
    {
      id: idFactory(),
      family: "leftWall",
      pos: { x: -10, y: 0 },
      size: { width: 10, height: 600 },
    },
    {
      id: idFactory(),
      family: "paddle",
      pos: { x: 400, y: 500 },
      size: { width: 60, height: 10 },
    },
    ...bricks,
  ];
};

const startGame = (ctx: CanvasRenderingContext2D) => {
  const particles = particleFactory();
  const eventQueue = createEventQueue();
  const paddle = particles.find((_) => _.family === "paddle");

  const paddleEvent = (x: number) => () => {
    eventQueue.enqueue({
      particle: paddle!,
      velocity: { x, y: 0 },
    });
  };

  gameControls({
    rightArrow: paddleEvent(7),
    leftArrow: paddleEvent(-7),
    keyUp: paddleEvent(0),
  });

  const update = updater([
    movementSystem,
    collisionSystem,
    eventHandler([velocityEventSystem, brickCollisionSystem]),
    renderer(ctx, [circleSystem(ctx), rectangleSystem(ctx)]),
  ]);

  gameLoop(update, { particles, events: eventQueue });
};

const Bricks = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) startGame(ctx);
  }, [canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{
        background: "black",
      }}
    />
  );
};

export default Bricks;
