import React from "react";
import {
  updater,
  movementSystem,
  useAnimationFrame,
  IPoint,
  IRect,
  idFactory,
  useRegisterParticle,
  particleList,
} from "../lib";
import { RecoilRoot, useSetRecoilState } from "recoil";

const Ball = ({ x, y }: IPoint) => {
  const ball = useRegisterParticle({
    id: idFactory(),
    pos: { x, y },
    radius: 20,
    velocity: { x: 2, y: 2 },
  });

  return ball ? (
    <circle r={ball.radius} cx={ball.pos.x} cy={ball.pos.y} stroke="grey" />
  ) : null;
};

const Board = (props: React.PropsWithChildren<IRect>) => {
  const setParticles = useSetRecoilState(particleList);
  const loop = updater([movementSystem]);

  useAnimationFrame(() => setParticles(loop));

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
    <RecoilRoot>
      <Board width={800} height={600}>
        <Ball x={30} y={30} />
      </Board>
    </RecoilRoot>
  );
};

export default Bounce;
