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
} from "../lib";

const FPS = 60;
const SHIP_SIZE = 4;
const TURN_SPEED = 180; // deg per second
const SHIP_THRUST = 5; // acceleration of the ship in pixels per sec
const FRICTION = 0.7; // friction coefficient of space. (0 = no friction, 1 = full friction)

const particleFactory = (): IParticle[] => {
  return [
    {
      id: idFactory(),
      family: "ship",
      pos: { x: 200, y: 200 },
      radius: SHIP_SIZE,
      velocity: { x: 0, y: 0 },
      friction: FRICTION,
      angle: 0,
      points: [
        [0, -6],
        [-3, 3],
        [0, 2],
        [3, 3],
        [0, -6],
      ],
    },
  ];
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
    keyUp: () => {
      events.enqueue({
        particle: ship!,
        rotation: 0,
        thrust: 0,
      });
    },
  });

  const update = updater([
    movementSystem,
    eventHandler([rotationEventSystem, thrustEventSystem]),
    renderer(ctx, [polygonSystem(ctx)]),
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
      width={800}
      height={600}
      style={{
        background: "black",
      }}
    />
  );
};

export default Ship;
