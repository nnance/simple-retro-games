import React, { Fragment } from "react";
import {
  IRect,
  idFactory,
  IParticle,
  updater,
  movementSystem,
  collisionSystem,
  useAnimationFrame,
  IPoint,
  ISystem,
} from "../lib";

const brickSize = { width: 60, height: 20 };
const rows = 2;
const cols = 7;

const GameContext = React.createContext<
  [IParticle[], React.Dispatch<React.SetStateAction<IParticle[]>>]
>([[], () => []]);

const Brick = ({ pos, size }: IParticle) => {
  return <rect {...pos} {...size} stroke="grey" fill="none" />;
};

const Grid = ({ x, y }: IPoint) => {
  const [particles] = React.useContext(GameContext);

  return (
    <Fragment>
      {particles.map((brick) =>
        brick.family === "brick" ? <Brick {...brick} /> : null
      )}
    </Fragment>
  );
};

const Ball = ({ pos, radius }: IParticle) => {
  return <circle r={radius} cx={pos.x} cy={pos.y} stroke="grey" fill="none" />;
};

const brickCollisionSystem: ISystem = (world) => {
  const particles = world.particles.reduce((prev, particle) => {
    const hit = world.events.find(
      (_) => _.particle.id === particle.id && particle.family === "brick"
    );
    return hit ? prev : [...prev, particle];
  }, [] as IParticle[]);
  return { ...world, particles };
};

const Board = (props: React.PropsWithChildren<IRect>) => {
  const [particles, setParticles] = React.useContext(GameContext);

  const gameLoop = updater([
    movementSystem,
    collisionSystem,
    brickCollisionSystem,
  ]);

  useAnimationFrame(() => {
    const newWorld = gameLoop({ particles, events: [] });
    setParticles(newWorld.particles);
  });

  return (
    <svg
      {...props}
      style={{
        background: "black",
      }}
    >
      <Ball {...particles[0]} />
      <Grid x={190} y={150} />
    </svg>
  );
};

const particleFactory = (): IParticle[] => {
  const { width, height } = brickSize;
  const x = 190;
  const y = 150;

  const bricks = Array.from(Array(rows), (_, row) =>
    Array.from(Array(cols), (_, col) => ({
      id: idFactory(),
      family: "brick",
      pos: { x: x + width * col, y: y + row * height },
      size: { width, height },
    }))
  );

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
    ...bricks.flat(),
  ];
};

const Bounce = () => {
  const particlesState = React.useState(particleFactory);

  return (
    <GameContext.Provider value={particlesState}>
      <Board width={800} height={600}></Board>
    </GameContext.Provider>
  );
};

export default Bounce;
