import {
  ISystem,
  IParticle,
  hasAngle,
  hasMovement,
  hasPos,
  hasEntity,
  hasRadius,
  hasSize,
  hasThrust,
} from "./types";

const FPS = 60;

const applyFriction = (particle: IParticle) => {
  if (hasMovement(particle) && hasThrust(particle)) {
    const { velocity, friction } = particle;

    return {
      ...particle,
      velocity: {
        x: velocity.x - (friction * velocity.x) / FPS,
        y: velocity.y - (friction * velocity.y) / FPS,
      },
    };
  }
  return particle;
};

const applyThrust = (particle: IParticle) => {
  if (hasMovement(particle) && hasAngle(particle) && hasThrust(particle)) {
    const { thrust, angle, velocity } = particle;

    return {
      ...particle,
      velocity: {
        x: velocity.x + (thrust * Math.cos(angle)) / FPS,
        y: velocity.y - (thrust * Math.sin(angle)) / FPS,
      },
    };
  }
  return particle;
};

const applyVelocity = (particle: IParticle) => {
  if (hasMovement(particle) && hasPos(particle)) {
    const { velocity, pos } = particle;

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

    if (hasAngle(state)) {
      return {
        ...pos,
        angle: state.rotation
          ? (state.angle || 0) + state.rotation
          : state.angle,
      };
    }
    return { ...pos };
  });

  return { ...world, particles };
};

export interface IBounceEvent {
  particle: IParticle;
  collider: IParticle;
}

export const bounceEventSystem = (event: IBounceEvent): ISystem => (world) => {
  if (
    hasEntity(event.collider) &&
    hasPos(event.collider) &&
    hasMovement(event.collider) &&
    hasRadius(event.collider)
  ) {
    const { id, pos, velocity, radius } = event.collider;

    const particles = world.particles.map((particle) => {
      if (
        hasEntity(particle) &&
        hasPos(event.particle) &&
        hasSize(event.particle) &&
        id === particle.id
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

export interface ICollisionEvent {
  particle: IParticle;
  collider: IParticle;
}

export type CollisionHandler = (event: ICollisionEvent) => ISystem;

export const collisionHandler: CollisionHandler = (event) => (world) => {
  return bounceEventSystem(event)(world);
};

export const collisionSystem = (handler: CollisionHandler): ISystem => (
  world
) => {
  world.particles.forEach((collider) => {
    if (hasMovement(collider) && hasRadius(collider) && hasPos(collider)) {
      const { pos, radius } = collider;

      const rect1 = {
        x: pos.x - radius,
        y: pos.y - radius,
        width: radius * 2,
        height: radius * 2,
      };

      world.particles.forEach((particle) => {
        if (
          hasSize(particle) &&
          hasPos(particle) &&
          hasEntity(particle) &&
          hasEntity(collider)
        ) {
          const rect2 = {
            x: particle.pos.x,
            y: particle.pos.y,
            width: particle.size.width,
            height: particle.size.height,
          };

          if (
            particle.id !== collider.id &&
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
          ) {
            world.queue!.enqueue(
              handler({
                particle,
                collider,
              })
            );
          }
        } else if (
          particle !== collider &&
          hasPos(particle) &&
          hasRadius(particle)
        ) {
          const dx = particle.pos.x - collider.pos.x;
          const dy = particle.pos.y - collider.pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < particle.radius + collider.radius) {
            world.queue!.enqueue(
              handler({
                particle,
                collider,
              })
            );
          }
        }
      });
    }
  });

  return world;
};
