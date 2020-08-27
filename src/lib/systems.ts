import { ISystem } from "./types";

export const movementSystem: ISystem = (world) => {
  const particles = world.particles.map((state) => ({
    ...state,
    pos: state.velocity
      ? {
          x: state.pos.x + state.velocity.x,
          y: state.pos.y + state.velocity.y,
        }
      : { ...state.pos },
    angle: state.rotation ? (state.angle || 0) + state.rotation : state.angle,
  }));

  return { ...world, particles };
};

export const velocityEventSystem: ISystem = (world) => {
  const event = world.events.find((_) => _.velocity !== undefined);

  const particles = world.particles.map((particle) => {
    return event && event.particle.id === particle.id
      ? {
          ...particle,
          velocity: event.velocity,
        }
      : particle;
  });

  return { ...world, particles };
};

export const rotationEventSystem: ISystem = (world) => {
  const event = world.events.find((_) => _.rotation !== undefined);

  const particles = world.particles.map((particle) => {
    return event && event.particle.id === particle.id
      ? {
          ...particle,
          rotation: event.rotation,
        }
      : particle;
  });

  return { ...world, particles };
};
