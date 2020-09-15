import {
  movementSystem,
  idFactory,
  collisionSystem,
  updater,
  IParticle,
} from ".";
import { worldFactor } from "./engine";
import {
  collisionHandler,
  CollisionHandler,
  bounceEventSystem,
} from "./systems";
import { IPos, IMovement, IEntity } from "./types";

test("moves based on velocity", () => {
  const ball: IParticle = {
    id: idFactory(),
    pos: { x: 10, y: 10 },
    radius: 20,
    velocity: { x: 5, y: 5 },
  };

  const { particles } = movementSystem(
    worldFactor({
      particles: [ball],
    })
  );

  expect(particles.length).toEqual(1);

  const { pos } = particles[0] as IPos;
  expect(pos.x).toEqual(15);
  expect(pos.y).toEqual(15);
});

test("detects circle bottom collision", () => {
  const ball: IParticle = {
    id: idFactory(),
    pos: { x: 100, y: 85 },
    radius: 20,
    velocity: { x: 5, y: 5 },
  };
  const wall: IParticle = {
    id: idFactory(),
    pos: { x: 50, y: 100 },
    size: { width: 100, height: 10 },
  };

  const world = collisionSystem(collisionHandler)(
    worldFactor({
      particles: [ball, wall],
    })
  );

  const { particles } = world.queue.dequeue()!(world);

  expect(particles.length).toEqual(2);

  const { pos, velocity } = particles[0] as IPos & IMovement;
  expect(pos.y).toEqual(80);
  expect(velocity?.y).toEqual(-5);
});

test("detects circle top collision", () => {
  const ball: IParticle = {
    id: idFactory(),
    pos: { x: 100, y: 25 },
    radius: 20,
    velocity: { x: 5, y: -5 },
  };
  const wall: IParticle = {
    id: idFactory(),
    pos: { x: 50, y: 0 },
    size: { width: 100, height: 10 },
  };

  const world = collisionSystem(collisionHandler)(
    worldFactor({
      particles: [ball, wall],
    })
  );

  const { particles } = world.queue.dequeue()!(world);

  expect(particles.length).toEqual(2);

  const { pos, velocity } = particles[0] as IPos & IMovement;
  expect(pos.y).toEqual(30);
  expect(velocity?.y).toEqual(5);
});

test("detects circle right collision", () => {
  const ball: IParticle = {
    id: idFactory(),
    pos: { x: 85, y: 10 },
    radius: 20,
    velocity: { x: 5, y: -5 },
  };
  const wall: IParticle = {
    id: idFactory(),
    pos: { x: 100, y: 0 },
    size: { width: 10, height: 100 },
  };

  const world = collisionSystem(collisionHandler)(
    worldFactor({
      particles: [ball, wall],
    })
  );

  const { particles } = world.queue.dequeue()!(world);

  expect(particles.length).toEqual(2);

  const { pos, velocity } = particles[0] as IPos & IMovement;
  expect(pos.y).toEqual(10);
  expect(pos.x).toEqual(80);
  expect(velocity?.x).toEqual(-5);
});

test("detects circle left collision", () => {
  const ball: IParticle = {
    id: idFactory(),
    pos: { x: 25, y: 10 },
    radius: 20,
    velocity: { x: 5, y: -5 },
  };
  const wall: IParticle = {
    id: idFactory(),
    pos: { x: 0, y: 0 },
    size: { width: 10, height: 100 },
  };

  const world = collisionSystem(collisionHandler)(
    worldFactor({
      particles: [ball, wall],
    })
  );

  const { particles } = world.queue.dequeue()!(world);

  expect(particles.length).toEqual(2);

  const { pos, velocity } = particles[0] as IPos & IMovement;
  expect(pos.y).toEqual(10);
  expect(pos.x).toEqual(30);
  expect(velocity?.x).toEqual(-5);
});

test("publishes events on circle collision", () => {
  const ball: IParticle = {
    id: idFactory(),
    pos: { x: 100, y: 85 },
    radius: 20,
    velocity: { x: 5, y: 5 },
  };
  const wall: IParticle = {
    id: idFactory(),
    pos: { x: 50, y: 100 },
    size: { width: 100, height: 10 },
  };

  const collisionHandler: CollisionHandler = (event) => (world) => {
    const particle = event.particle as IEntity;
    const collider = event.particle as IEntity;

    expect(particle.id).toEqual((wall as IEntity).id);
    expect(collider.id).toEqual((ball as IEntity).id);
    return bounceEventSystem(event)(world);
  };

  const { queue } = collisionSystem(collisionHandler)(
    worldFactor({
      particles: [ball, wall],
    })
  );

  queue.peek();
  expect(queue.isEmpty()).toBeFalsy();
});

test("publishes collision event after game loop", () => {
  const ball: IParticle = {
    id: idFactory(),
    pos: { x: 100, y: 75 },
    radius: 20,
    velocity: { x: 5, y: 5 },
  };
  const wall: IParticle = {
    id: idFactory(),
    pos: { x: 50, y: 100 },
    size: { width: 100, height: 10 },
  };

  const collisionHandler: CollisionHandler = (event) => (world) => {
    const particle = event.particle as IEntity;
    const collider = event.particle as IEntity;

    expect(particle.id).toEqual((wall as IEntity).id);
    expect(collider.id).toEqual((ball as IEntity).id);
    return bounceEventSystem(event)(world);
  };

  const gameLoop = updater([movementSystem, collisionSystem(collisionHandler)]);

  const newWorld = gameLoop(
    worldFactor({
      particles: [ball, wall],
    })
  );

  const { queue } = gameLoop({ ...newWorld });

  queue.peek();
  expect(queue.isEmpty()).toBeFalsy();
});
