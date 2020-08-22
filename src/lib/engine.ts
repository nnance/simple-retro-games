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

export const collisionSystem: ISystem = (particles) => {
  const checkParticles = (particle: IParticle) => {
    if (particle.velocity && particle.radius) {
      const { pos, velocity, radius } = particle;

      const rect1 = {
        x: pos.x - radius,
        y: pos.y - radius,
        width: radius * 2,
        height: radius * 2,
      };

      particles.forEach((part) => {
        if (part.size) {
          const rect2 = {
            x: part.pos.x,
            y: part.pos.y,
            width: part.size.width,
            height: part.size.height,
          };

          if (
            part !== particle &&
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
          ) {
            if (rect1.y - velocity.y + rect1.height <= rect2.y) {
              particle.pos = { ...pos, y: rect2.y - radius };
              particle.velocity = { ...velocity, y: velocity.y * -1 };
            } else if (rect1.y - velocity.y >= rect2.y + rect2.height) {
              particle.pos = { ...pos, y: rect2.y + rect2.height + radius };
              particle.velocity = { ...velocity, y: velocity.y * -1 };
            } else if (rect1.x - velocity.x + rect1.width <= rect2.x) {
              particle.pos = { ...pos, x: rect2.x - radius };
              particle.velocity = { ...velocity, x: velocity.x * -1 };
            } else {
              particle.pos = { ...pos, x: rect2.x + rect2.width + radius };
              particle.velocity = { ...velocity, x: velocity.x * -1 };
            }
          }
        }
      });
    }
    return { ...particle };
  };

  return particles.map((particle) =>
    particle.velocity ? checkParticles(particle) : particle
  );
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
