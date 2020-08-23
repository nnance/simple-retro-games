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
} from "../lib";
import { RecoilRoot, useSetRecoilState } from "recoil";

const brickSize = { width: 60, height: 20 };
const rows = 2;
const cols = 7;

const Brick = ({ body }: { body: IParticle }) => {
  useRegisterParticle(body);
  return <rect {...body.pos} {...body.size!} stroke="grey" fill="none" />;
};

const Grid = ({ x, y }: IPoint) => {
  const { width, height } = brickSize;

  const bricksRef = React.useRef(
    Array.from(Array(rows), (_, row) =>
      Array.from(Array(cols), (_, col) => ({
        id: idFactory(),
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
  const [paddle, setPaddle] = useRegisterParticle({
    id: idFactory(),
    pos: { x, y },
    size: { width, height },
  });

  const updateVelocity = (x: number) => () =>
    setPaddle((paddle) => ({ ...paddle!, velocity: { x, y: 0 } }));

  useGameControls({
    leftArrow: updateVelocity(-7),
    rightArrow: updateVelocity(7),
    keyUp: updateVelocity(0),
  });

  return paddle ? (
    <rect {...paddle.pos} {...paddle.size} stroke="grey" fill="none" />
  ) : null;
};

const Board = (props: React.PropsWithChildren<IRect>) => {
  const setParticles = useSetRecoilState(particleList);
  const loop = updater([movementSystem, collisionSystem]);

  useAnimationFrame(() => setParticles(loop));

  return (
    <svg
      width={props.width}
      height={props.height}
      style={{
        background: "black",
      }}
    >
      {props.children}
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
