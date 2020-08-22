import { movementSystem, idFactory, collisionSystem } from "./engine";
import { IParticle } from "./types";

test("moves based on velocity", () => {
  const ball: IParticle = {
    id: idFactory(),
    pos: { x: 10, y: 10 },
    radius: 20,
    velocity: { x: 5, y: 5 },
  };
  const updated = movementSystem([ball]);

  expect(updated.length).toEqual(1);
  expect(updated[0].pos.x).toEqual(15);
  expect(updated[0].pos.y).toEqual(15);
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

  const updated = collisionSystem([ball, wall]);

  expect(updated.length).toEqual(2);
  expect(updated[0].pos.y).toEqual(80);
  expect(updated[0].velocity?.y).toEqual(-5);
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

  const updated = collisionSystem([ball, wall]);

  expect(updated.length).toEqual(2);
  expect(updated[0].pos.y).toEqual(30);
  expect(updated[0].velocity?.y).toEqual(5);
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

  const updated = collisionSystem([ball, wall]);

  expect(updated.length).toEqual(2);
  expect(updated[0].pos.y).toEqual(10);
  expect(updated[0].pos.x).toEqual(80);
  expect(updated[0].velocity?.x).toEqual(-5);
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

  const updated = collisionSystem([ball, wall]);

  expect(updated.length).toEqual(2);
  expect(updated[0].pos.y).toEqual(10);
  expect(updated[0].pos.x).toEqual(30);
  expect(updated[0].velocity?.x).toEqual(-5);
});
