import React from "react";
import {
  IParticle,
  idFactory,
  movementSystem,
  updater,
  IWorld,
  collisionSystem,
  renderer,
  gameLoop,
} from "../lib";

const circleSystem = (ctx: CanvasRenderingContext2D) => (world: IWorld) => {
  world.particles.forEach((ball) => {
    if (ball.radius) {
      ctx.strokeStyle = "grey";
      ctx.beginPath();
      ctx.arc(ball.pos.x, ball.pos.y, ball.radius!, 0, Math.PI * 2, true); // Outer circle
      ctx.stroke();
    }
  });
  return world;
};

const particleFactory = (): IParticle[] => {
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
      pos: { x: 0, y: 600 },
      size: { width: 800, height: 10 },
    },
    {
      id: idFactory(),
      pos: { x: 800, y: 0 },
      size: { width: 10, height: 600 },
    },
    {
      id: idFactory(),
      pos: { x: 0, y: -10 },
      size: { width: 800, height: 10 },
    },
    {
      id: idFactory(),
      pos: { x: -10, y: 0 },
      size: { width: 10, height: 600 },
    },
  ];
};

const Bounce = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    if (ctx) {
      const update = updater([movementSystem, collisionSystem]);
      const render = renderer(ctx, [circleSystem(ctx)]);
      const particles = particleFactory();

      gameLoop(ctx, update, render, particles);
    }
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

export default Bounce;
