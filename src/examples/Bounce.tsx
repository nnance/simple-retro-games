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
  collisionSystem,
} from "../lib";
import { RecoilRoot, useSetRecoilState } from "recoil";

const Wall = (props: IPoint & IRect) => {
  const wall = useRegisterParticle({
    id: idFactory(),
    pos: { x: props.x, y: props.y },
    size: { width: props.width, height: props.height },
  });

  return wall ? <rect {...props} stroke="grey" fill="none" /> : null;
};

const Ball = ({ x, y }: IPoint) => {
  const [ball] = useRegisterParticle({
    id: idFactory(),
    pos: { x, y },
    radius: 20,
    velocity: { x: 3, y: 3 },
  });

  return ball ? (
    <circle
      r={ball.radius}
      cx={ball.pos.x}
      cy={ball.pos.y}
      stroke="grey"
      fill="none"
    />
  ) : null;
};

const Board = (props: React.PropsWithChildren<IRect>) => {
  const setParticles = useSetRecoilState(particleList);
  const loop = updater([movementSystem, collisionSystem]);

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
        <Wall x={0} y={0} width={800} height={10} />
        <Wall x={0} y={590} width={800} height={10} />
        <Wall x={0} y={0} width={10} height={600} />
        <Wall x={790} y={0} width={10} height={600} />
      </Board>
    </RecoilRoot>
  );
};

export default Bounce;
