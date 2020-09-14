import React, { Fragment } from "react";
import {
  IRect,
  IParticle,
  updater,
  movementSystem,
  collisionSystem,
  useAnimationFrame,
  useGameControls,
  bounceEventSystem,
  GameProvider,
  useGameContext,
  CollisionHandler,
  queueHandler,
  worldFactory,
  ICollisionEvent,
  ISystem,
  particleFactory,
} from "../lib";
import { useColSize } from "../Layout";

const brickSize = { width: 60, height: 20 };
const rows = 2;
const cols = 7;

const brickCollisionSystem = (event: ICollisionEvent): ISystem => (world) => {
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

const Grid = () => {
  const [{ particles }] = useGameContext();

  return (
    <Fragment>
      {particles.map((brick, idx) =>
        brick.family === "brick" ? <Brick key={idx} {...brick} /> : null
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
  const [{ particles, queue }] = useGameContext();
  const paddle = particles.find((_) => _.family === "paddle");

  const paddleEvent = (x: number) => () => {
    queue.enqueue((world) => {
      const particles = world.particles.map((particle) =>
        particle.family === "paddle"
          ? { ...particle, velocity: { x, y: 0 } }
          : particle
      );

      return { ...world, particles };
    });
  };

  useGameControls({
    rightArrow: paddleEvent(7),
    leftArrow: paddleEvent(-7),
    keyUp: paddleEvent(0),
    pause: () =>
      queue.enqueue((world) => ({ ...world, paused: !world.paused })),
  });

  return paddle ? (
    <rect {...paddle.pos} {...paddle.size} stroke="grey" fill="none" />
  ) : null;
};

const collisionHandler: CollisionHandler = (event) => (world) => {
  const bounceUpdate = bounceEventSystem(event)(world);
  return brickCollisionSystem(event)(bounceUpdate);
};

const update = updater([
  movementSystem,
  collisionSystem(collisionHandler),
  queueHandler,
]);

const Board = (props: React.PropsWithChildren<IRect>) => {
  const [, setGameState] = useGameContext();

  const gameLoop = React.useCallback(() => {
    setGameState((state) => {
      const updated = update(state);
      return updated.paused ? { ...state, paused: true } : updated;
    });
  }, [setGameState]);

  React.useEffect(() => {
    const { width, height } = props;
    const particles = particlesFactory({ width, height });

    setGameState(
      worldFactory({
        paused: true,
        particles,
      })
    );
  }, [props, setGameState]);

  useAnimationFrame(gameLoop);

  return (
    <svg
      {...props}
      style={{ background: "black", width: "100%", height: "100%" }}
      viewBox={`0 0 ${props.width} ${props.height}`}
    >
      <Ball />
      <Paddle />
      <Grid />
    </svg>
  );
};

const particlesFactory = ({ width, height }: IRect): IParticle[] => {
  const x = 190;
  const y = 150;

  const bricks = Array.from(Array(rows), (_, row) =>
    Array.from(Array(cols), (_, col) =>
      particleFactory({
        family: "brick",
        pos: { x: x + brickSize.width * col, y: y + row * brickSize.height },
        size: brickSize,
      })
    )
  ).flat();

  return [
    particleFactory({
      family: "ball",
      pos: { x: 30, y: 100 },
      radius: 5,
      velocity: { x: 3, y: 3 },
    }),
    particleFactory({
      family: "floor",
      pos: { x: 0, y: height },
      size: { width, height: 10 },
    }),
    particleFactory({
      family: "rightWall",
      pos: { x: width, y: 0 },
      size: { width: 10, height },
    }),
    particleFactory({
      family: "top",
      pos: { x: 0, y: -10 },
      size: { width, height: 10 },
    }),
    particleFactory({
      family: "leftWall",
      pos: { x: -10, y: 0 },
      size: { width: 10, height },
    }),
    particleFactory({
      family: "paddle",
      pos: { x: 400, y: 500 },
      size: { width: 60, height: 10 },
    }),
    ...bricks,
  ];
};

const Bricks = () => {
  const [size] = useColSize();

  return (
    <GameProvider>
      <Board {...size} />
    </GameProvider>
  );
};

export default Bricks;
