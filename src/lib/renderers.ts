import { IWorld, ISystem } from "./types";

export type RenderSystem = (
  ctx: CanvasRenderingContext2D,
  world: IWorld
) => IWorld;

export const renderer = (
  ctx: CanvasRenderingContext2D,
  systems: RenderSystem[]
): ISystem => (world: IWorld) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  systems.forEach((system) => system(ctx, world));
  return world;
};

export const circleSystem: RenderSystem = (ctx, world) => {
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

export const rectangleSystem: RenderSystem = (ctx, world) => {
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

const scalePolygon = (points: [number, number][], c: number) => {
  // ordinary vector multiplication
  return points.map((point) => [point[0] * c, point[1] * c]);
};

export const drawPolygon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  angle: number,
  points: [number, number][],
  scale = 1,
  showBounding = false,
  lineColor = "white",
  lineWidth = 1
) => {
  const rotated = rotatePolygon(angle, points);
  const offsets = scalePolygon(rotated, scale);

  ctx.beginPath();
  ctx.moveTo(x + offsets[0][0], y + offsets[0][1]);

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;

  // POLYGON
  offsets.forEach((offset, idx) => {
    if (idx > 0) {
      ctx.lineTo(x + offset[0], y + offset[1]);
    }
  });

  ctx.closePath();
  ctx.stroke();

  if (showBounding) {
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.stroke();
  }
};

export const polygonSystem = (showBounding: boolean): RenderSystem => (
  ctx,
  world
) => {
  world.particles.forEach((particle) => {
    if (particle.points) {
      const {
        pos: { x, y },
        radius = 0,
        angle = 0,
        scale,
        points,
      } = particle;

      drawPolygon(
        ctx,
        x,
        y,
        radius,
        angle,
        points,
        scale,
        showBounding,
        "grey"
      );
    }
  });
  return world;
};
