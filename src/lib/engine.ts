import React from "react";
import { ISystem, IParticle } from "./types";

const MAX_NUM = 100000;

export const idFactory = () => Math.floor(Math.random() * MAX_NUM);

export const movementSystem: ISystem = (
  particles: IParticle[]
): IParticle[] => {
  return particles.map((state) => ({
    ...state,
    pos: state.velocity
      ? {
          x: state.pos.x + state.velocity.x,
          y: state.pos.y + state.velocity.y,
        }
      : { ...state.pos },
  }));
};

export const updater = (systems: ISystem[]) => (
  particles: IParticle[]
): IParticle[] => {
  return systems.reduce((prev, system) => {
    return system(prev);
  }, particles);
};

export const useAnimationFrame = (updater: () => void) => {
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
