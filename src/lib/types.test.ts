import {
  IEntity,
  IRadius,
  IPos,
  IMovement,
  IWorld,
  ISize,
  ISystem,
  hasMovement,
} from "./types";
import { idFactory } from "./engine";
import { createSystemQueue } from "./queue";

interface IBall extends IEntity, IRadius, IPos, IMovement {}
interface IWall extends IEntity, ISize, IPos {}
type Components = IBall | IWall;

const ball = {
  id: idFactory(),
  family: "ball",
  radius: 20,
  pos: { x: 10, y: 10 },
  velocity: { x: 5, y: 5 },
} as IBall;

const wall = {
  id: idFactory(),
  family: "wall",
  pos: { x: 10, y: 10 },
} as IWall;

test("world can contain one type of particle", () => {
  const world: IWorld<IBall> = {
    paused: false,
    particles: [ball],
    queue: createSystemQueue(),
  };

  expect(world.particles.length).toEqual(1);
});

test("world can contain multiple types of particle", () => {
  const world: IWorld<Components> = {
    paused: false,
    particles: [ball, wall],
    queue: createSystemQueue(),
  };

  expect(world.particles.length).toEqual(2);
});

test("system can process a single type", () => {
  const movementSystem: ISystem<IBall> = (world) => ({
    ...world,
    particles: world.particles.map((comp) => ({
      ...comp,
      pos: { x: 15, y: 15 },
    })),
  });

  const world: IWorld<IBall> = {
    paused: false,
    particles: [ball],
    queue: createSystemQueue(),
  };

  const newWorld = movementSystem(world);

  expect(newWorld.particles.length).toEqual(1);
  expect(newWorld.particles[0].pos.x).toEqual(15);
});

test("system can process multiple types", () => {
  const movementSystem: ISystem<IMovement> = (world) => ({
    ...world,
    particles: world.particles.map((comp) => ({
      ...comp,
      pos: { x: 15, y: 15 },
    })),
  });

  const world: IWorld<Components> = {
    paused: false,
    particles: [ball, wall],
    queue: createSystemQueue(),
  };

  const newWorld = movementSystem(world);

  expect(newWorld.particles.length).toEqual(2);
  expect(newWorld.particles[0].pos.x).toEqual(15);
});
