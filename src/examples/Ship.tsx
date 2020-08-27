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
} from "../lib";

const particleFactory = (): IParticle[] => {
  return [
    {
      id: idFactory(),
      family: "ship",
      pos: { x: 200, y: 200 },
      radius: 3,
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

  const update = updater([movementSystem]);

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
