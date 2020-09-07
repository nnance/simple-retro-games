import {
  movementSystem,
  idFactory,
  collisionSystem,
  updater,
  IParticle,
} from ".";
import { createEventQueue } from "./queue";

test("moves based on velocity", () => {
  const ball: IParticle = {
    id: idFactory(),
    pos: { x: 10, y: 10 },
    radius: 20,
    velocity: { x: 5, y: 5 },
  };

  const { particles } = movementSystem({
    particles: [ball],
    events: createEventQueue(),
  });

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

  const { particles } = collisionSystem({
    particles: [ball, wall],
    events: createEventQueue(),
  });

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

  const { particles } = collisionSystem({
    particles: [ball, wall],
    events: createEventQueue(),
  });

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

  const { particles } = collisionSystem({
    particles: [ball, wall],
    events: createEventQueue(),
  });

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

  const { particles } = collisionSystem({
    particles: [ball, wall],
    events: createEventQueue(),
  });

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

  const { events } = collisionSystem({
    particles: [ball, wall],
    events: createEventQueue(),
  });

  const event = events.peek();
  expect(events.isEmpty()).toBeFalsy();
  expect(event?.particle.id).toEqual(wall.id);
  expect(event?.collider?.id).toEqual(ball.id);
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

  const gameLoop = updater([movementSystem, collisionSystem]);

  const newWorld = gameLoop({
    particles: [ball, wall],
    events: createEventQueue(),
  });

  const { events } = gameLoop({ ...newWorld, events: createEventQueue() });

  const event = events.peek();
  expect(events.isEmpty()).toBeFalsy();
  expect(event?.particle.id).toEqual(wall.id);
  expect(event?.collider?.id).toEqual(ball.id);
});
