import { ISystem, IParticle, IEventSystem } from "./types";

const FPS = 60;

const applyFriction = (particle: IParticle) => {
  const { velocity, friction, thrust } = particle;
  if (velocity && thrust === 0 && friction) {
    return {
      ...particle,
      velocity: {
        x: velocity.x - (friction * velocity.x) / FPS,
        y: velocity.y - (friction * velocity.y) / FPS,
      },
    };
  } else return particle;
};

const applyThrust = (particle: IParticle) => {
  const { velocity, thrust, angle } = particle;
  if (velocity && thrust && angle !== undefined) {
    return {
      ...particle,
      velocity: {
        x: velocity.x + (thrust * Math.cos(angle)) / FPS,
        y: velocity.y - (thrust * Math.sin(angle)) / FPS,
      },
    };
  } else return particle;
};

const applyVelocity = (particle: IParticle) => {
  const { velocity, pos } = particle;

  if (velocity) {
    return {
      ...particle,
      pos: {
        x: pos.x + velocity.x,
        y: pos.y + velocity.y,
      },
    };
  }
  return particle;
};

export const movementSystem: ISystem = (world) => {
  const particles = world.particles.map((state) => {
    const movement = applyThrust(state);
    const velocity = applyFriction(movement);
    const pos = applyVelocity(velocity);

    return {
      ...pos,
      angle: state.rotation ? (state.angle || 0) + state.rotation : state.angle,
    };
  });

  return { ...world, particles };
};

export const velocityEventSystem: IEventSystem = (event, world) => {
  if (event.velocity !== undefined) {
    const particles = world.particles.map((particle) => {
      return event.particle.id === particle.id
        ? {
            ...particle,
            velocity: event.velocity,
          }
        : particle;
    });
    return { ...world, particles };
  }
  return world;
};

export const rotationEventSystem: IEventSystem = (event, world) => {
  if (event.rotation !== undefined) {
    const particles = world.particles.map((particle) => {
      return event.particle.id === particle.id
        ? {
            ...particle,
            rotation: event.rotation,
          }
        : particle;
    });

    return { ...world, particles };
  }
  return world;
};

export const thrustEventSystem: IEventSystem = (event, world) => {
  if (event.thrust !== undefined) {
    const particles = world.particles.map((particle) => {
      return event.particle.id === particle.id
        ? {
            ...particle,
            thrust: event.thrust,
          }
        : particle;
    });

    return { ...world, particles };
  }
  return world;
};
