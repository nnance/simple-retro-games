import { IWorld, ISystem } from "./types";

export const renderer = (
  ctx: CanvasRenderingContext2D,
  systems: ISystem[]
): ISystem => (world: IWorld) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  systems.forEach((system) => system(world));
  return world;
};

export const circleSystem = (ctx: CanvasRenderingContext2D): ISystem => (
  world: IWorld
) => {
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

export const rectangleSystem = (ctx: CanvasRenderingContext2D): ISystem => (
  world: IWorld
) => {
  world.particles.forEach((ball) => {
    if (ball.size) {
      ctx.strokeStyle = "grey";
      ctx.strokeRect(ball.pos.x, ball.pos.y, ball.size.width, ball.size.height);
    }
  });
  return world;
};

const rotatePolygon = (
  angle: number,
  offsets: [number, number][]
): [number, number][] => {
  return offsets.map((offset) => [
    offset[0] * Math.sin(angle) - offset[1] * Math.cos(angle),
    offset[0] * Math.cos(angle) + offset[1] * Math.sin(angle),
  ]);
};

export const drawPolygon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  angle: number,
  points: [number, number][],
  lineColor = "white",
  lineWidth = 1
) => {
  const offsets = rotatePolygon(angle, points);

  ctx.beginPath();
  ctx.moveTo(x + radius * offsets[0][0], y + radius * offsets[0][1]);

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;

  // POLYGON
  offsets.forEach((offset, idx) => {
    if (idx > 0) {
      ctx.lineTo(x + radius * offset[0], y + radius * offset[1]);
    }
  });

  ctx.closePath();
  ctx.stroke();
};

export const polygonSystem = (ctx: CanvasRenderingContext2D): ISystem => (
  world: IWorld
) => {
  const showBounding = true;
  world.particles.forEach((particle) => {
    if (particle.points) {
      const {
        pos: { x, y },
        radius = 0,
        angle = 0,
        points,
      } = particle;
      drawPolygon(ctx, x, y, radius, angle, points, "grey");
      if (showBounding) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.stroke();
      }
    }
  });
  return world;
};
