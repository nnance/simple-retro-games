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
  useGameControls,
  IEventSystem,
  eventHandler,
  bounceEventSystem,
  GameProvider,
  useGameContext,
} from "../lib";

const brickSize = { width: 60, height: 20 };
const rows = 2;
const cols = 7;

const brickCollisionSystem: IEventSystem = (event, world) => {
  if (event.collider && event.particle.family === "brick") {
    const particles = world.particles.reduce((prev, particle) => {
      const hit = event.particle.id === particle.id;
      return hit ? prev : [...prev, particle];
    }, [] as IParticle[]);

    return { ...world, particles };
  }
  return world;
};

const Brick = ({ pos, size }: IParticle) => {
  return <rect {...pos} {...size} stroke="grey" fill="none" />;
};

const Grid = ({ x, y }: IPoint) => {
  const [{ particles }] = useGameContext();

  return (
    <Fragment>
      {particles.map((brick) =>
        brick.family === "brick" ? <Brick {...brick} /> : null
      )}
    </Fragment>
  );
};

const Ball = () => {
  const [{ particles }] = useGameContext();
  const ball = particles.find((_) => _.family === "ball");

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

const Paddle = () => {
  const [{ particles }, setGameState] = useGameContext();
  const paddle = particles.find((_) => _.family === "paddle");

  const setVelocity = (x: number) => () => {
    setGameState(({ particles, ...state }) => ({
      ...state,
      particles: particles.map((particle) =>
        particle.family === "paddle"
          ? { ...particle, velocity: { x, y: 0 } }
          : particle
      ),
    }));
  };

  useGameControls({
    rightArrow: setVelocity(7),
    leftArrow: setVelocity(-7),
    keyUp: setVelocity(0),
    pause: () => setGameState((state) => ({ ...state, paused: !state.paused })),
  });

  return paddle ? (
    <rect {...paddle.pos} {...paddle.size} stroke="grey" fill="none" />
  ) : null;
};

const Board = (props: React.PropsWithChildren<IRect>) => {
  const [gameState, setGameState] = useGameContext();

  const update = updater([
    movementSystem,
    collisionSystem,
    eventHandler([bounceEventSystem, brickCollisionSystem]),
  ]);

  const gameLoop = React.useCallback(() => {
    if (!gameState.paused) {
      const newWorld = update(gameState);
      setGameState(newWorld);
    }
  }, [gameState, setGameState, update]);

  useAnimationFrame(gameLoop);

  return (
    <svg
      {...props}
      style={{
        background: "black",
      }}
    >
      <Ball />
      <Paddle />
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
  ).flat();

  return [
    {
      id: idFactory(),
      family: "ball",
      pos: { x: 30, y: 100 },
      radius: 5,
      velocity: { x: 3, y: 3 },
    },
    {
      id: idFactory(),
      family: "floor",
      pos: { x: 0, y: 600 },
      size: { width: 800, height: 10 },
    },
    {
      id: idFactory(),
      family: "rightWall",
      pos: { x: 800, y: 0 },
      size: { width: 10, height: 600 },
    },
    {
      id: idFactory(),
      family: "top",
      pos: { x: 0, y: -10 },
      size: { width: 800, height: 10 },
    },
    {
      id: idFactory(),
      family: "leftWall",
      pos: { x: -10, y: 0 },
      size: { width: 10, height: 600 },
    },
    {
      id: idFactory(),
      family: "paddle",
      pos: { x: 400, y: 500 },
      size: { width: 60, height: 10 },
    },
    ...bricks,
  ];
};

const Bricks = () => {
  const state = { particles: particleFactory() };

  return (
    <GameProvider {...state}>
      <Board width={800} height={600}></Board>
    </GameProvider>
  );
};

export default Bricks;
