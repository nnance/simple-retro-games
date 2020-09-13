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
  expect(particles[0].pos.x).toEqual(15);
  expect(particles[0].pos.y).toEqual(15);
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
  expect(particles[0].pos.y).toEqual(80);
  expect(particles[0].velocity?.y).toEqual(-5);
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
  expect(particles[0].pos.y).toEqual(30);
  expect(particles[0].velocity?.y).toEqual(5);
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
  expect(particles[0].pos.y).toEqual(10);
  expect(particles[0].pos.x).toEqual(80);
  expect(particles[0].velocity?.x).toEqual(-5);
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
  expect(particles[0].pos.y).toEqual(10);
  expect(particles[0].pos.x).toEqual(30);
  expect(particles[0].velocity?.x).toEqual(-5);
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
    expect(event.particle.id).toEqual(wall.id);
    expect(event.collider.id).toEqual(ball.id);
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
    expect(event.particle.id).toEqual(wall.id);
    expect(event.collider.id).toEqual(ball.id);
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
