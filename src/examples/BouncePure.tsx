import React from "react";
import {
  IParticle,
  idFactory,
  ISystem,
  movementSystem,
  updater,
  IWorld,
  collisionSystem,
} from "../lib";

const render = (ctx: CanvasRenderingContext2D, particles: IParticle[]) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const ball = particles.find((_) => _.family === "ball");

  if (ball) {
    ctx.strokeStyle = "grey";
    ctx.beginPath();
    ctx.arc(ball.pos.x, ball.pos.y, ball.radius!, 0, Math.PI * 2, true); // Outer circle
    ctx.stroke();
  }
};

const startGame = (
  ctx: CanvasRenderingContext2D,
  systems: ISystem[],
  particles: IParticle[]
) => {
  const update = updater(systems);

  const loop = (world: IWorld) => {
    const newWorld = update(world);
    render(ctx, newWorld.particles);

    requestAnimationFrame(() => {
      loop(newWorld);
    });
  };

  loop({ particles, events: [] });
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
    const particles = particleFactory();
    const systems = [movementSystem, collisionSystem];

    if (ctx) startGame(ctx, systems, particles);
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
