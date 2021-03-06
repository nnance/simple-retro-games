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
  IEventSystem,
} from "../lib";
import { ColSizeContext } from "../Layout";

const FPS = 60;
const SHOW_BOUNDING = false;
const SHIP_SIZE = 10;
const SHIP_SCALE = 3;
const ASTEROIDS_SIZE = [40, 20, 10]; // size in pixel per stage
const ASTEROIDS_SCALE = [10, 5, 2]; // size in pixel per stage
const ASTEROIDS_SPEED = 3; // max starting speed in pixels per sec
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

const asteroidFactory = (
  stage: number,
  { width, height }: IRect
): IParticle[] => {
  const velocity = () => random(ASTEROIDS_SPEED * -1, ASTEROIDS_SPEED);

  return ASTEROIDS.map((points) => ({
    id: idFactory(),
    family: "asteroid",
    pos: { x: random(0, width), y: random(0, width) },
    radius: Math.ceil(ASTEROIDS_SIZE[stage - 1]),
    scale: Math.ceil(ASTEROIDS_SCALE[stage - 1]),
    velocity: { x: velocity(), y: velocity() },
    points,
  }));
};

const particleFactory = (size: IRect): IParticle[] => {
  const ship = {
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
  } as IParticle;

  return [ship, ...asteroidFactory(1, size)];
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

const shipCollisionSystem: IEventSystem = (event, world) => {
  if (
    event.collider &&
    event.collider.family === "asteroid" &&
    event.particle.family === "ship"
  ) {
    const particles = world.particles.reduce((prev, particle) => {
      const hit = event.collider?.id === particle.id;
      return hit ? prev : [...prev, particle];
    }, [] as IParticle[]);

    return { ...world, particles };
  }
  return world;
};

const startGame = (ctx: CanvasRenderingContext2D, size: IRect) => {
  const particles = particleFactory(size);
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
    keyUp: (keyCode = 0) => {
      if ([KeyCode.leftArrow, KeyCode.rightArrow].includes(keyCode)) {
        events.enqueue({
          particle: ship!,
          rotation: 0,
        });
      } else if (keyCode === KeyCode.upArrow) {
        events.enqueue({
          particle: ship!,
          thrust: 0,
        });
      }
    },
  });

  const update = updater([
    movementSystem,
    collisionSystem,
    offScreenSystem(size),
    eventHandler([rotationEventSystem, thrustEventSystem, shipCollisionSystem]),
    renderer(ctx, [polygonSystem(ctx, SHOW_BOUNDING)]),
  ]);

  gameLoop(update, { particles, events });
};

const Ship = () => {
  const [size] = React.useContext(ColSizeContext);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    if (ctx) startGame(ctx, size);
  }, [canvasRef, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ background: "black", width: "100%", height: "100%" }}
      {...size}
    />
  );
};

export default Ship;
