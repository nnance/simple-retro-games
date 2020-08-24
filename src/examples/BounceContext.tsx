import React from "react";
import {
  IRect,
  idFactory,
  IParticle,
  updater,
  movementSystem,
  collisionSystem,
  useAnimationFrame,
} from "../lib";

const Ball = ({ pos, radius }: IParticle) => {
  return <circle r={radius} cx={pos.x} cy={pos.y} stroke="grey" fill="none" />;
};

const Board = (props: React.PropsWithChildren<IRect>) => {
  return (
    <svg
      {...props}
      style={{
        background: "black",
      }}
    >
      {props.children}
    </svg>
  );
};

const particleFactory = (): IParticle[] => {
  return [
    {
      id: idFactory(),
      pos: { x: 30, y: 30 },
      radius: 5,
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
  const [particles, setParticles] = React.useState(particleFactory);

  const gameLoop = updater([movementSystem, collisionSystem]);

  useAnimationFrame(() => {
    const newWorld = gameLoop({ particles, events: [] });
    setParticles(newWorld.particles);
  });

  return (
    <Board width={800} height={600}>
      <Ball {...particles[0]} />
    </Board>
  );
};

export default Bounce;
