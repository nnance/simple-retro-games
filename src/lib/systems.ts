import {
  ISystem,
  IParticle,
  getAngle,
  isMovement,
  getThrust,
  isPosition,
  getMovement,
  isAngle,
  getRadius,
  getPosition,
  getSize,
  IPosition,
  IMovement,
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

export interface IBounceEvent {
  particle: IParticle;
  collider: IParticle;
}

export type CollisionHandler = (event: IBounceEvent) => ISystem;

export const bounceEventSystem: CollisionHandler = (event) => (world) => {
  if (event.collider) {
    const colliderPos = getPosition(event.collider);
    const colliderMovement = getMovement(event.collider);
    const colliderRadius = getRadius(event.collider);

    if (colliderPos && colliderMovement && colliderRadius) {
      const { id } = event.collider;
      const { pos } = colliderPos;
      const { velocity } = colliderMovement;
      const { radius } = colliderRadius;

      const particles = world.particles.map((particle) => {
        if (id === particle.id) {
          const particlePos = getPosition(event.particle);
          const particleSize = getSize(event.particle);

          const rect1 = {
            x: pos.x - radius,
            y: pos.y - radius,
            width: radius * 2,
            height: radius * 2,
          };

          const rect2 = {
            x: particlePos?.pos.x || 0,
            y: particlePos?.pos.y || 0,
            width: particleSize?.size.width || 0,
            height: particleSize?.size.height || 0,
          };

          if (rect1.y - velocity.y + rect1.height <= rect2.y) {
            return {
              ...particle,
              components: particle.components.map((comp) => {
                if (isPosition(comp))
                  return { pos: { ...pos, y: rect2.y - radius } } as IPosition;
                else if (isMovement(comp))
                  return {
                    velocity: { ...velocity, y: velocity.y * -1 },
                  } as IMovement;
                return comp;
              }),
            };
          } else if (rect1.y - velocity.y >= rect2.y + rect2.height) {
            return {
              ...particle,
              components: particle.components.map((comp) => {
                if (isPosition(comp))
                  return {
                    pos: { ...pos, y: rect2.y + rect2.height + radius },
                  } as IPosition;
                else if (isMovement(comp))
                  return {
                    velocity: { ...velocity, y: velocity.y * -1 },
                  } as IMovement;
                return comp;
              }),
            };
          } else if (rect1.x - velocity.x + rect1.width <= rect2.x) {
            return {
              ...particle,
              components: particle.components.map((comp) => {
                if (isPosition(comp))
                  return { pos: { ...pos, x: rect2.x - radius } } as IPosition;
                else if (isMovement(comp))
                  return {
                    velocity: { ...velocity, x: velocity.x * -1 },
                  } as IMovement;
                return comp;
              }),
            };
          } else {
            return {
              ...particle,
              components: particle.components.map((comp) => {
                if (isPosition(comp))
                  return {
                    pos: { ...pos, x: rect2.x + rect2.width + radius },
                  } as IPosition;
                else if (isMovement(comp))
                  return {
                    velocity: { ...velocity, x: velocity.x * -1 },
                  } as IMovement;
                return comp;
              }),
            };
          }
        }
        return particle;
      });
      return { ...world, particles };
    }
    return world;
  }
  return world;
};

export const collisionSystem = (handler: CollisionHandler): ISystem => (
  world
) => {
  world.particles.forEach((collider) => {
    const radiusObj = getRadius(collider);
    const posObj = getPosition(collider);
    if (radiusObj && posObj) {
      const { radius } = radiusObj;
      const { pos } = posObj;

      const rect1 = {
        x: pos.x - radius,
        y: pos.y - radius,
        width: radius * 2,
        height: radius * 2,
      };

      world.particles.forEach((particle) => {
        const particleSize = getSize(particle);
        const particleRadius = getRadius(particle);
        const particlePos = getPosition(particle);

        const colliderRadius = getRadius(collider);
        const colliderPos = getPosition(collider);

        if (particleSize && particlePos) {
          const { pos } = particlePos;
          const { size } = particleSize;
          const rect2 = {
            x: pos.x,
            y: pos.y,
            width: size.width,
            height: size.height,
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
          particle.id !== collider.id &&
          particleRadius &&
          colliderRadius &&
          particlePos &&
          colliderPos
        ) {
          const dx = particlePos.pos.x - colliderPos.pos.x;
          const dy = particlePos.pos.y - colliderPos.pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < particleRadius.radius + colliderRadius.radius) {
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
