import React from "react";
import { ISystem, IParticle, IWorld, EventType } from "./types";

const MAX_NUM = 100000;

export const idFactory = () => Math.floor(Math.random() * MAX_NUM);

export const movementSystem: ISystem = (world) => {
  const particles = world.particles.map((state) => ({
    ...state,
    pos: state.velocity
      ? {
          x: state.pos.x + state.velocity.x,
          y: state.pos.y + state.velocity.y,
        }
      : { ...state.pos },
  }));

  return { ...world, particles };
};

const checkParticles = (world: IWorld) => (particle: IParticle) => {
  if (particle.velocity && particle.radius) {
    const { pos, velocity, radius } = particle;

    const rect1 = {
      x: pos.x - radius,
      y: pos.y - radius,
      width: radius * 2,
      height: radius * 2,
    };

    world.particles.forEach((part) => {
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

          world.events.push({
            particle: part,
            type: EventType.collision,
            collider: particle,
          });
        }
      }
    });
  }

  return { ...particle };
};

export const collisionSystem: ISystem = (world) => {
  const bounceChecker = checkParticles(world);

  const particles = world.particles.map((particle) =>
    particle.velocity ? bounceChecker(particle) : particle
  );

  return { ...world, particles };
};

export const updater = (systems: ISystem[]) => (world: IWorld): IWorld => {
  return systems.reduce((prev, system) => system(prev), world);
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
