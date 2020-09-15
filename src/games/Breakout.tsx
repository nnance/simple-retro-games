import React, { Fragment } from "react";
import {
  IRect,
  idFactory,
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
  worldFactor,
  ICollisionEvent,
  ISystem,
  IColor,
  IPos,
  ISize,
  hasEntity,
  hasPos,
  hasSize,
  hasColor,
  hasRadius,
} from "../lib";
import { useColSize } from "../Layout";

type ColorCode = "R" | "O" | "G" | "Y";

// the wall width takes up the remaining space of the canvas width. with 14 bricks
// and 13 2px gaps between them, thats: 400 - (14 * 25 + 2 * 13) = 24px. so each
// wall will be 12px
const wallSize = 12;

// each row is 14 bricks long. the level consists of 6 blank rows then 8 rows
// of 4 colors: red, orange, green, and yellow
const level1: ColorCode[][] = [
  [],
  [],
  [],
  [],
  [],
  [],
  ["R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R"],
  ["R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R"],
  ["O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O"],
  ["O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O"],
  ["G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"],
  ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"],
];

// create a mapping between color short code (R, O, G, Y) and color name
const colorMap = {
  R: "red",
  O: "orange",
  G: "green",
  Y: "yellow",
};

// use a 2px gap between each brick
const brickGap = 2;

const brickSize = { width: 25, height: 12 };

const Brick = ({ pos, size, color }: IPos & ISize & IColor) => {
  return (
    <rect {...pos} {...size} stroke={color || "grey"} fill={color || "none"} />
  );
};

const getBricks = (): IParticle[] => {
  const bricks: IParticle[] = [];

  // create the level by looping over each row and column in the level1 array
  // and creating an object with the bricks position (x, y) and color
  for (let row = 0; row < level1.length; row++) {
    for (let col = 0; col < level1[row].length; col++) {
      const colorCode = level1[row][col];
      const { width, height } = brickSize;

      bricks.push({
        id: idFactory(),
        family: "brick",
        pos: {
          x: wallSize + (width + brickGap) * col,
          y: wallSize + (height + brickGap) * row,
        },
        color: colorMap[colorCode],
        size: brickSize,
      });
    }
  }
  return bricks;
};

const brickCollisionSystem = (event: ICollisionEvent): ISystem => (world) => {
  if (
    event.collider &&
    hasEntity(event.particle) &&
    event.particle.family === "brick"
  ) {
    const particles = world.particles.reduce((prev, particle) => {
      const hit =
        hasEntity(event.particle) &&
        hasEntity(particle) &&
        event.particle.id === particle.id;
      return hit ? prev : [...prev, particle];
    }, [] as IParticle[]);

    return { ...world, particles };
  }
  return world;
};

const Grid = () => {
  const [{ particles }] = useGameContext();

  return (
    <Fragment>
      {particles.map((brick, idx) =>
        hasEntity(brick) &&
        hasPos(brick) &&
        hasSize(brick) &&
        hasColor(brick) &&
        brick.family === "brick" ? (
          <Brick key={idx} {...brick} />
        ) : null
      )}
    </Fragment>
  );
};

const Ball = () => {
  const [{ particles }] = useGameContext();
  const ball = particles.find((_) => hasEntity(_) && _.family === "ball");

  return ball && hasPos(ball) && hasRadius(ball) ? (
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
  const paddle = particles.find((_) => hasEntity(_) && _.family === "paddle");

  const paddleEvent = (x: number) => () => {
    queue.enqueue((world) => {
      const particles = world.particles.map((particle) =>
        hasEntity(particle) && particle.family === "paddle"
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

  return paddle && hasPos(paddle) && hasSize(paddle) ? (
    <rect {...paddle.pos} {...paddle.size} stroke="cyan" fill="none" />
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
    const particles = particleFactory({ width, height });

    setGameState(
      worldFactor({
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

const particleFactory = ({ width, height }: IRect): IParticle[] => {
  const bricks = getBricks().flat();

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
      family: "rightWall",
      pos: { x: width, y: 0 },
      size: { width: 10, height },
    },
    {
      id: idFactory(),
      family: "top",
      pos: { x: 0, y: -10 },
      size: { width, height: 10 },
    },
    {
      id: idFactory(),
      family: "leftWall",
      pos: { x: -10, y: 0 },
      size: { width: 10, height },
    },
    {
      id: idFactory(),
      family: "paddle",
      pos: { x: width / 2 - brickSize.width / 2, y: 500 },
      size: brickSize,
    },
    ...bricks,
  ];
};

const Breakout = () => {
  const [size] = useColSize();

  return (
    <GameProvider>
      <Board {...size} />
    </GameProvider>
  );
};

export default Breakout;
