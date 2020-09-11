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

    if (state.rotation && state.angle) {
      return {
        ...pos,
        angle: state.rotation
          ? (state.angle || 0) + state.rotation
          : state.angle,
      };
    } else {
      return { ...pos };
    }
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

export const bounceEventSystem: IEventSystem = (event, world) => {
  if (event.collider !== undefined) {
    const { id, pos, velocity, radius } = event.collider;

    const particles = world.particles.map((particle) => {
      if (
        id === particle.id &&
        velocity !== undefined &&
        radius !== undefined
      ) {
        const rect1 = {
          x: pos.x - radius,
          y: pos.y - radius,
          width: radius * 2,
          height: radius * 2,
        };

        const rect2 = {
          x: event.particle.pos.x,
          y: event.particle.pos.y,
          width: event.particle.size?.width || 0,
          height: event.particle.size?.height || 0,
        };

        if (rect1.y - velocity.y + rect1.height <= rect2.y) {
          return {
            ...particle,
            pos: { ...pos, y: rect2.y - radius },
            velocity: { ...velocity, y: velocity.y * -1 },
          };
        } else if (rect1.y - velocity.y >= rect2.y + rect2.height) {
          return {
            ...particle,
            pos: { ...pos, y: rect2.y + rect2.height + radius },
            velocity: { ...velocity, y: velocity.y * -1 },
          };
        } else if (rect1.x - velocity.x + rect1.width <= rect2.x) {
          return {
            ...particle,
            pos: { ...pos, x: rect2.x - radius },
            velocity: { ...velocity, x: velocity.x * -1 },
          };
        } else {
          return {
            ...particle,
            pos: { ...pos, x: rect2.x + rect2.width + radius },
            velocity: { ...velocity, x: velocity.x * -1 },
          };
        }
      } else return particle;
    });
    return { ...world, particles };
  }

  return world;
};

export const collisionSystem: ISystem = (world) => {
  world.particles.forEach((collider) => {
    if (collider.velocity && collider.radius) {
      const { pos, radius } = collider;

      const rect1 = {
        x: pos.x - radius,
        y: pos.y - radius,
        width: radius * 2,
        height: radius * 2,
      };

      world.particles.forEach((particle) => {
        if (particle.size) {
          const rect2 = {
            x: particle.pos.x,
            y: particle.pos.y,
            width: particle.size.width,
            height: particle.size.height,
          };

          if (
            particle !== collider &&
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
          ) {
            world.events.enqueue({
              particle: particle,
              collider,
            });
          }
        } else if (
          particle !== collider &&
          particle.radius &&
          collider.radius
        ) {
          const dx = particle.pos.x - collider.pos.x;
          const dy = particle.pos.y - collider.pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < particle.radius + collider.radius) {
            world.events.enqueue({
              particle: particle,
              collider,
            });
          }
        }
      });
    }
  });

  return world;
};
