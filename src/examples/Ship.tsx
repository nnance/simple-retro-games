import React from "react";
import {
  IParticle,
  idFactory,
  updater,
  movementSystem,
  renderer,
  gameLoop,
  polygonSystem,
  gameControls,
  rotationEventSystem,
  thrustEventSystem,
  createEventQueue,
  eventHandler,
  KeyCode,
  random,
  IRect,
  ISystem,
  collisionSystem,
} from "../lib";

const SIZE = { width: 800, height: 600 };
const FPS = 60;
const SHOW_BOUNDING = false;
const SHIP_SIZE = 12;
const SHIP_SCALE = 4;
const ASTEROIDS_NUM = 3;
const ASTEROIDS_SIZE = [40, 20, 10]; // size in pixel per stage
const ASTEROIDS_SCALE = [10, 5, 2]; // size in pixel per stage
const ASTEROIDS_SPEED = 50; // max starting speed in pixels per sec
const ASTEROIDS_VERT = 10; // avg num of vertices
const ASTEROID_JAG = 0.3;
const TURN_SPEED = 180; // deg per second
const SHIP_THRUST = 5; // acceleration of the ship in pixels per sec
const FRICTION = 0.7; // friction coefficient of space. (0 = no friction, 1 = full friction)
const ASTEROIDS = [
  [
    [-4, -2],
    [-2, -4],
    [0, -2],
    [2, -4],
    [4, -2],
    [3, 0],
    [4, 2],
    [1, 4],
    [-2, 4],
    [-4, 2],
    [-4, -2],
  ],
  [
    [-3, 0],
    [-4, -2],
    [-2, -4],
    [0, -3],
    [2, -4],
    [4, -2],
    [2, -1],
    [4, 1],
    [2, 4],
    [-1, 3],
    [-2, 4],
    [-4, 2],
    [-3, 0],
  ],
  [
    [-2, 0],
    [-4, -1],
    [-1, -4],
    [2, -4],
    [4, -1],
    [4, 1],
    [2, 4],
    [0, 4],
    [0, 1],
    [-2, 4],
    [-4, 1],
    [-2, 0],
  ],
  [
    [-1, -2],
    [-2, -4],
    [1, -4],
    [4, -2],
    [4, -1],
    [1, 0],
    [4, 2],
    [2, 4],
    [1, 3],
    [-2, 4],
    [-4, 1],
    [-4, -2],
    [-1, -2],
  ],
  [
    [-4, -2],
    [-2, -4],
    [2, -4],
    [4, -2],
    [4, 2],
    [2, 4],
    [-2, 4],
    [-4, 2],
    [-4, -2],
  ],
] as [number, number][][];

const asteroidFactory = (): IParticle[] => {
  const stage = 1;

  return ASTEROIDS.map((points) => ({
    id: idFactory(),
    family: "asteroid",
    pos: { x: random(0, SIZE.width), y: random(0, SIZE.width) },
    radius: Math.ceil(ASTEROIDS_SIZE[stage - 1]),
    scale: Math.ceil(ASTEROIDS_SCALE[stage - 1]),
    velocity: { x: random(-2, 2), y: random(-2, 2) },
    points,
  }));
};

const createAsteroid = (
  x: number,
  y: number,
  level: number,
  stage = 1
): IParticle => {
  const levelMultiplier = 1 + 0.1 * level;
  const angle = Math.random() * Math.PI * 2; // in rad
  const length = Math.floor(
    Math.random() * (ASTEROIDS_VERT + 1) + ASTEROIDS_VERT / 2
  );

  const offsets = Array.from(
    { length },
    () => Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG
  );

  const vert = offsets.length;
  const points = offsets.map(
    (offset, j) =>
      [
        offset * Math.cos(angle + (j * Math.PI * 2) / vert),
        offset * Math.sin(angle + (j * Math.PI * 2) / vert),
      ] as [number, number]
  );

  return {
    id: idFactory(),
    family: "asteroid",
    pos: { x, y },
    velocity: {
      x:
        ((Math.random() * ASTEROIDS_SPEED * levelMultiplier) / FPS) *
        (Math.random() < 0.5 ? 1 : -1),
      y:
        ((Math.random() * ASTEROIDS_SPEED * levelMultiplier) / FPS) *
        (Math.random() < 0.5 ? 1 : -1),
    },
    radius: Math.ceil(ASTEROIDS_SIZE[stage - 1] / 2),
    angle,
    points,
  };
};

const asteroidBeltFactory = () => {
  return ASTEROIDS.map(() =>
    createAsteroid(
      Math.floor(Math.random() * SIZE.width),
      Math.floor(Math.random() * SIZE.height),
      1
    )
  );
};

const particleFactory = (): IParticle[] => {
  return [
    {
      id: idFactory(),
      family: "ship",
      pos: { x: 200, y: 200 },
      radius: SHIP_SIZE,
      scale: SHIP_SCALE,
      velocity: { x: 0, y: 0 },
      friction: FRICTION,
      angle: 0,
      points: [
        [0, -6],
        [-3, 3],
        [0, 1],
        [3, 3],
        [0, -6],
      ],
    },
    ...asteroidFactory(),
  ];
};

const offScreenSystem = (size: IRect): ISystem => (world) => {
  const particles = world.particles.map((particle) => ({
    ...particle,
    pos: {
      x:
        particle.pos.x < 0
          ? size.width
          : particle.pos.x > size.width
          ? 0
          : particle.pos.x,
      y:
        particle.pos.y < 0
          ? size.height
          : particle.pos.y > size.height
          ? 0
          : particle.pos.y,
    },
  }));
  return { ...world, particles };
};

const startGame = (ctx: CanvasRenderingContext2D) => {
  const particles = particleFactory();
  const events = createEventQueue();

  const ship = particles.find((_) => _.family === "ship");

  gameControls({
    leftArrow: () => {
      events.enqueue({
        particle: ship!,
        rotation: ((TURN_SPEED / 180) * Math.PI) / FPS,
      });
    },
    rightArrow: () => {
      events.enqueue({
        particle: ship!,
        rotation: ((-TURN_SPEED / 180) * Math.PI) / FPS,
      });
    },
    upArrow: () => {
      events.enqueue({
        particle: ship!,
        thrust: SHIP_THRUST,
      });
    },
    keyUp: (keyCode) => {
      events.enqueue({
        particle: ship!,
        rotation: [KeyCode.leftArrow, KeyCode.rightArrow].includes(keyCode || 0)
          ? 0
          : ship?.rotation,
        thrust: keyCode === KeyCode.upArrow ? 0 : ship?.thrust,
      });
    },
  });

  const update = updater([
    movementSystem,
    collisionSystem,
    offScreenSystem(SIZE),
    eventHandler([rotationEventSystem, thrustEventSystem]),
    renderer(ctx, [polygonSystem(ctx, SHOW_BOUNDING)]),
  ]);

  gameLoop(update, { particles, events });
};

const Ship = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    if (ctx) startGame(ctx);
  }, [canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      {...SIZE}
      style={{
        background: "black",
      }}
    />
  );
};

export default Ship;
