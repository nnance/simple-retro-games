import {
  IWorld,
  ISystem,
  getColor,
  getAngle,
  getPosition,
  getRadius,
  getSize,
  getPoints,
} from "./types";

export type RenderSystem = (
  ctx: CanvasRenderingContext2D,
  world: IWorld
) => void;

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
    const pos = getPosition(ball);
    const radius = getRadius(ball);
    const points = getPoints(ball);

    if (pos && radius && !points) {
      ctx.strokeStyle = "grey";
      ctx.beginPath();
      ctx.arc(pos.pos.x, pos.pos.y, radius.radius!, 0, Math.PI * 2, true); // Outer circle
      ctx.stroke();
    }
  });
};

export const rectangleSystem: RenderSystem = (ctx, world) => {
  world.particles.forEach((particle) => {
    const pos = getPosition(particle);
    const size = getSize(particle);

    if (pos && size) {
      const colorComponent = getColor(particle);

      if (colorComponent) {
        ctx.fillStyle = colorComponent.color;
        ctx.fillRect(pos.pos.x, pos.pos.y, size.size.width, size.size.height);
      } else {
        ctx.strokeStyle = "grey";
        ctx.strokeRect(pos.pos.x, pos.pos.y, size.size.width, size.size.height);
      }
    }
  });
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
    const pos = getPosition(particle);
    const radius = getRadius(particle);
    const angle = getAngle(particle);
    const points = getPoints(particle);

    if (pos && radius && points && angle) {
      drawPolygon(
        ctx,
        pos.pos.x,
        pos.pos.y,
        radius.radius,
        angle.angle,
        points.points,
        points.scale,
        showBounding,
        "grey"
      );
    }
  });
};
