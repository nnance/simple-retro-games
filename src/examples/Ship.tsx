import React from "react";
import {
  IParticle,
  idFactory,
  createEvents,
  updater,
  movementSystem,
  renderer,
  gameLoop,
  polygonSystem,
  gameControls,
  rotationEventSystem,
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
  const eventStore = createEvents();

  const ship = particles.find((_) => _.family === "ship");

  gameControls({
    leftArrow: () => {
      eventStore.push({
        particle: ship!,
        rotation: ((TURN_SPEED / 180) * Math.PI) / FPS,
      });
    },
    rightArrow: () => {
      eventStore.push({
        particle: ship!,
        rotation: ((-TURN_SPEED / 180) * Math.PI) / FPS,
      });
    },
    keyUp: () => {
      eventStore.push({
        particle: ship!,
        rotation: 0,
      });
    },
  });

  const update = updater([movementSystem, rotationEventSystem]);

  const render = renderer(ctx, [polygonSystem(ctx)]);

  gameLoop(ctx, update, render, particles, eventStore);
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
