import { IWorld, ISystem } from "./types";

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
