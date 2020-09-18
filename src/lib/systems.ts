import {
  ISystem,
  IParticle,
  getAngle,
  isMovement,
  getThrust,
  isPosition,
  getMovement,
  isAngle,
} from "./types";

const FPS = 60;

const applyFriction = (particle: IParticle) => {
  return {
    ...particle,
    components: particle.components.map((comp) => {
      if (isMovement(comp)) {
        const thrust = getThrust(particle);
        if (thrust) {
          const { velocity } = comp;
          const { friction } = thrust;
          return {
            velocity: {
              x: velocity.x - (friction * velocity.x) / FPS,
              y: velocity.y - (friction * velocity.y) / FPS,
            },
          };
        }
        return comp;
      }
      return comp;
    }),
  };
};

const applyThrust = (particle: IParticle) => {
  return {
    ...particle,
    components: particle.components.map((comp) => {
      if (isMovement(comp)) {
        const thrust = getThrust(particle);
        const angle = getAngle(particle);
        const { velocity } = comp;
        if (thrust && angle) {
          return {
            velocity: {
              x: velocity.x + (thrust.thrust * Math.cos(angle.angle)) / FPS,
              y: velocity.y - (thrust.thrust * Math.sin(angle.angle)) / FPS,
            },
          };
        }
        return comp;
      }
      return comp;
    }),
  };
};

const applyRotation = (particle: IParticle) => {
  return {
    ...particle,
    components: particle.components.map((comp) => {
      if (isAngle(comp)) {
        const { angle, rotation } = comp;
        return {
          ...comp,
          angle: angle + rotation,
        };
      }
      return comp;
    }),
  };
};

const applyVelocity = (particle: IParticle) => {
  return {
    ...particle,
    components: particle.components.map((comp) => {
      if (isPosition(comp)) {
        const movement = getMovement(particle);
        const { pos } = comp;
        if (movement) {
          return {
            pos: {
              x: pos.x + movement.velocity.x,
              y: pos.y + movement.velocity.y,
            },
          };
        }
        return comp;
      }
      return comp;
    }),
  };
};

export const movementSystem: ISystem = (world) => {
  const particles = world.particles.map((state) => {
    const movement = applyThrust(state);
    const velocity = applyFriction(movement);
    const pos = applyVelocity(velocity);
    return applyRotation(pos);
  });

  return { ...world, particles };
};
/*
export interface IBounceEvent {
  particle: IParticle;
  collider: IParticle;
}

export const bounceEventSystem = (event: IBounceEvent): ISystem => (world) => {
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
            world.queue!.enqueue(
              handler({
                particle,
                collider,
              })
            );
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
*/
