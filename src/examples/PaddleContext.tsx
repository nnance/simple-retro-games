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
  IBounceEvent,
  ISystem,
  particleFactory,
  IPosition,
  ISize,
  IRadius,
  IMovement,
  getPosition,
  getRadius,
  getSize,
  getMovement,
  isMovement,
} from "../lib";
import { useColSize } from "../Layout";

const brickSize = { width: 60, height: 20 };
const rows = 2;
const cols = 7;

const brickCollisionSystem = (event: IBounceEvent): ISystem => (world) => {
  if (event.collider && event.particle.family === "brick") {
    const particles = world.particles.reduce((prev, particle) => {
      const hit = event.particle.id === particle.id;
      return hit ? prev : [...prev, particle];
    }, [] as IParticle[]);

    return { ...world, particles };
  }
  return world;
};

const Brick = (particle: IParticle) => {
  const pos = getPosition(particle);
  const size = getSize(particle);

  return pos && size ? (
    <rect {...pos.pos} {...size.size} stroke="grey" fill="none" />
  ) : null;
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
  const pos = getPosition(ball!);
  const radius = getRadius(ball!);

  return ball && pos && radius ? (
    <circle
      r={radius.radius}
      cx={pos.pos.x}
      cy={pos.pos.y}
      stroke="grey"
      fill="none"
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
              components: getMovement(particle)
                ? particle.components.map((comp) => {
                    return isMovement(comp)
                      ? ({ velocity: { x, y: 0 } } as IMovement)
                      : comp;
                  })
                : [
                    ...particle.components,
                    { velocity: { x, y: 0 } } as IMovement,
                  ],
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
    <rect {...pos.pos} {...size.size} stroke="grey" fill="none" />
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
        components: [
          {
            pos: {
              x: x + brickSize.width * col,
              y: y + row * brickSize.height,
            },
          } as IPosition,
          { size: brickSize } as ISize,
        ],
      })
    )
  ).flat();

  return [
    particleFactory({
      family: "ball",
      components: [
        { pos: { x: 30, y: 100 } } as IPosition,
        { radius: 5 } as IRadius,
        { velocity: { x: 3, y: 3 } } as IMovement,
      ],
    }),
    particleFactory({
      family: "floor",
      components: [
        { pos: { x: 0, y: height } } as IPosition,
        { size: { width, height: 10 } } as ISize,
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
      ],
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
