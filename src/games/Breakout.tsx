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
  ISystem,
  particleFactory,
  getColor,
  IColor,
  IPosition,
  ISize,
  getPosition,
  getSize,
  getRadius,
  IRadius,
  IMovement,
  isMovement,
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

const Brick = (particle: IParticle) => {
  const pos = getPosition(particle);
  const size = getSize(particle);
  const color = getColor(particle) || { color: "grey" };

  return pos && size && color ? (
    <rect {...pos.pos} {...size.size} stroke={color.color} fill={color.color} />
  ) : null;
};

const getBricks = (x = 190, y = 0): IParticle[] => {
  const bricks: IParticle[] = [];

  // create the level by looping over each row and column in the level1 array
  // and creating an object with the bricks position (x, y) and color
  for (let row = 0; row < level1.length; row++) {
    for (let col = 0; col < level1[row].length; col++) {
      const colorCode = level1[row][col];
      const { width, height } = brickSize;

      const components = [
        {
          pos: {
            x: x + wallSize + (width + brickGap) * col,
            y: y + wallSize + (height + brickGap) * row,
          },
        } as IPosition,
        { size: brickSize } as ISize,
        { color: colorMap[colorCode] } as IColor,
      ];

      bricks.push(
        particleFactory({
          family: "brick",
          components,
        })
      );
    }
  }
  return bricks;
};

const brickCollisionSystem: CollisionHandler = (event): ISystem => (world) => {
  if (event.collider && event.particle.family === "brick") {
    const particles = world.particles.reduce((prev, particle) => {
      const hit = event.particle.id === particle.id;
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
        brick.family === "brick" ? <Brick key={idx} {...brick} /> : null
      )}
    </Fragment>
  );
};

const Ball = () => {
  const [{ particles }] = useGameContext();
  const ball = particles.find((_) => _.family === "ball");
  const radius = getRadius(ball!);
  const pos = getPosition(ball!);
  const color = getColor(ball!) || { color: "grey" };

  return ball && radius && pos ? (
    <circle
      r={radius.radius}
      cx={pos.pos.x}
      cy={pos.pos.y}
      stroke={color.color}
      fill={color.color}
    />
  ) : null;
};

const Paddle = () => {
  const [{ particles, queue }] = useGameContext();
  const paddle = particles.find((_) => _.family === "paddle");
  const pos = getPosition(paddle!);
  const size = getSize(paddle!);

  const paddleEvent = (x: number) => () => {
    queue.enqueue((world) => {
      const particles = world.particles.map((particle) =>
        particle.family === "paddle"
          ? {
              ...particle,
              components: particle.components.map((comp) => {
                return isMovement(comp)
                  ? ({ velocity: { x, y: 0 } } as IMovement)
                  : comp;
              }),
            }
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

  return paddle && pos && size ? (
    <rect {...pos.pos} {...size.size} fill="cyan" />
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
  const bricks = getBricks().flat();

  return [
    particleFactory({
      family: "ball",
      components: [
        { pos: { x: 30, y: 100 } } as IPosition,
        { radius: 5 } as IRadius,
        { velocity: { x: 3, y: 3 } } as IMovement,
        { color: "grey" } as IColor,
      ],
    }),
    particleFactory({
      family: "rightWall",
      components: [
        { pos: { x: width, y: 0 } } as IPosition,
        { size: { width: 10, height } } as ISize,
      ],
    }),
    particleFactory({
      family: "top",
      components: [
        { pos: { x: 0, y: -10 } } as IPosition,
        { size: { width, height: 10 } } as ISize,
      ],
    }),
    particleFactory({
      family: "leftWall",
      components: [
        { pos: { x: -10, y: 0 } } as IPosition,
        { size: { width: 10, height } } as ISize,
      ],
    }),
    particleFactory({
      family: "paddle",
      components: [
        { pos: { x: 400, y: height - 100 } } as IPosition,
        { size: { width: 60, height: 10 } } as ISize,
        { velocity: { x: 0, y: 0 } } as IMovement,
      ],
    }),
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
