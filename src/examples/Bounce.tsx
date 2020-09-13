import React from "react";
import {
  IParticle,
  idFactory,
  movementSystem,
  collisionSystem,
  updater,
  renderer,
  gameLoop,
  circleSystem,
  IRect,
  collisionHandler,
  queueHandler,
  worldFactor,
} from "../lib";
import { useColSize } from "../Layout";

const particleFactory = ({ width, height }: IRect): IParticle[] => {
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
      pos: { x: 0, y: height },
      size: { width, height: 10 },
    },
    {
      id: idFactory(),
      pos: { x: width, y: 0 },
      size: { width: 10, height },
    },
    {
      id: idFactory(),
      pos: { x: 0, y: -10 },
      size: { width, height: 10 },
    },
    {
      id: idFactory(),
      pos: { x: -10, y: 0 },
      size: { width: 10, height },
    },
  ];
};

const Bounce = () => {
  const [size] = useColSize();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    const particles = particleFactory(size);

    if (ctx) {
      const update = updater([
        movementSystem,
        collisionSystem(collisionHandler),
        queueHandler,
        renderer(ctx, [circleSystem(ctx)]),
      ]);

      return gameLoop(
        update,
        worldFactor({
          particles,
        })
      );
    }
  }, [canvasRef, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ background: "black", width: "100%", height: "100%" }}
      {...size}
    />
  );
};

export default Bounce;
