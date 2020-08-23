import React, { Fragment } from "react";
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
  IParticle,
  useGameControls,
  ISystem,
  eventList,
} from "../lib";
import { RecoilRoot, useRecoilState, useSetRecoilState } from "recoil";

const brickSize = { width: 60, height: 20 };
const rows = 2;
const cols = 7;

const Brick = ({ body }: { body: IParticle }) => {
  const [brick] = useRegisterParticle(body);
  return brick ? (
    <rect {...brick.pos} {...brick.size} stroke="grey" fill="none" />
  ) : null;
};

const Grid = ({ x, y }: IPoint) => {
  const { width, height } = brickSize;

  const bricksRef = React.useRef(
    Array.from(Array(rows), (_, row) =>
      Array.from(Array(cols), (_, col) => ({
        id: idFactory(),
        family: "brick",
        pos: { x: x + width * col, y: y + row * height },
        size: { width, height },
      }))
    )
  );

  return (
    <Fragment>
      {bricksRef.current.flat().map((brick) => (
        <Brick body={brick} />
      ))}
    </Fragment>
  );
};

const Wall = (props: IPoint & IRect) => {
  useRegisterParticle({
    id: idFactory(),
    pos: { x: props.x, y: props.y },
    size: { width: props.width, height: props.height },
  });

  return <rect {...props} stroke="grey" fill="none" />;
};

const Ball = ({ x, y }: IPoint) => {
  const [ball] = useRegisterParticle({
    id: idFactory(),
    pos: { x, y },
    radius: 5,
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

const Paddle = ({ x, y, width, height }: IPoint & IRect) => {
  const setEvents = useSetRecoilState(eventList);
  const [paddle] = useRegisterParticle({
    id: idFactory(),
    pos: { x, y },
    size: { width, height },
  });

  const updateVelocity = React.useCallback(
    (x: number) => () => setEvents((events) => [...events]),
    [setEvents]
  );

  useGameControls({
    leftArrow: updateVelocity(-7),
    rightArrow: updateVelocity(7),
    keyUp: updateVelocity(0),
  });

  return paddle ? (
    <rect {...paddle.pos} {...paddle.size} stroke="grey" fill="none" />
  ) : null;
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

const Board = ({ children, ...props }: React.PropsWithChildren<IRect>) => {
  const [particles, setParticles] = useRecoilState(particleList);

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
      {children}
    </svg>
  );
};

const Bounce = () => {
  const width = 800;
  const height = 600;
  const offset = 10;
  const gridX = Math.floor(width / 2 - (cols * brickSize.width) / 2);

  return (
    <RecoilRoot>
      <Board width={width} height={height}>
        <Ball x={50} y={200} />
        <Wall x={0} y={0} width={width} height={offset} />
        <Wall x={0} y={height - offset} width={width} height={offset} />
        <Wall x={0} y={0} width={offset} height={height} />
        <Wall x={width - offset} y={0} width={offset} height={height} />
        <Grid x={gridX} y={150} />
        <Paddle x={450} y={500} width={60} height={20} />
      </Board>
    </RecoilRoot>
  );
};

export default Bounce;
