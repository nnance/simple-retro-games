import React from "react";

interface IPoint {
  x: number;
  y: number;
}

interface IRect {
  width: number;
  height: number;
}

interface IParticle {
  pos: IPoint;
  radius?: number;
  velocity?: IPoint;
}

const useAnimationFrame = (updater: () => void) => {
  const frame = React.useRef(0);

  React.useEffect(() => {
    function loop(): void {
      frame.current = requestAnimationFrame(() => {
        updater();
        loop();
      });
    }
    loop();

    return (): void => cancelAnimationFrame(frame.current);
  }, [updater]);
};

const Ball = ({ pos: { x, y }, radius }: IParticle) => {
  return <circle r={radius} cx={x} cy={y} stroke="grey" />;
};

const Bounce = () => {
  const [ball, setBall] = React.useState<IParticle>({
    pos: { x: 30, y: 30 },
    radius: 20,
    velocity: { x: 2, y: 2 },
  });

  useAnimationFrame(() => {
    setBall((state) => ({
      ...state,
      pos: state.velocity
        ? {
            x: state.pos.x + state.velocity.x,
            y: state.pos.y + state.velocity.y,
          }
        : { ...state.pos },
    }));
  });

  return (
    <svg
      width={800}
      height={600}
      style={{
        background: "black",
      }}
    >
      <Ball {...ball} />
    </svg>
  );
};

export default Bounce;
