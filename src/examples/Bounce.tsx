import React from "react";
import {
  IParticle,
  updater,
  movementSystem,
  useAnimationFrame,
  IPoint,
  IRect,
} from "../lib/engine";

const Ball = ({ x, y }: IPoint) => {
  const [ball, setBall] = React.useState<IParticle[]>([
    {
      pos: { x, y },
      radius: 20,
      velocity: { x: 2, y: 2 },
    },
  ]);

  const loop = updater([movementSystem]);
  useAnimationFrame(() => setBall(loop));

  return (
    <circle
      r={ball[0].radius}
      cx={ball[0].pos.x}
      cy={ball[0].pos.y}
      stroke="grey"
    />
  );
};

const Board = (props: React.PropsWithChildren<IRect>) => {
  return (
    <svg
      width={800}
      height={600}
      style={{
        background: "black",
      }}
    >
      {props.children}
    </svg>
  );
};

const Bounce = () => {
  return (
    <Board width={800} height={600}>
      <Ball x={30} y={30} />
    </Board>
  );
};

export default Bounce;
