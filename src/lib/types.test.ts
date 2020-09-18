import { IWorld, ISystem, isAngle, IAngle, getAngle } from "./types";
import { idFactory } from "./engine";
import { createSystemQueue } from "./queue";

const ball = {
  id: idFactory(),
  family: "ball",
  radius: 20,
  pos: { x: 10, y: 10 },
  velocity: { x: 5, y: 5 },
  components: [],
};

const wall = {
  id: idFactory(),
  family: "wall",
  pos: { x: 10, y: 10 },
  components: [],
};

const ship = {
  id: idFactory(),
  family: "ship",
  pos: { x: 10, y: 10 },
  components: [
    {
      angle: 10,
      rotation: 5,
    } as IAngle,
  ],
};

const movementSystem: ISystem = (world) => ({
  ...world,
  particles: world.particles.map((particle) => ({
    ...particle,
    components: particle.components.map((comp) => {
      if (isAngle(comp)) {
        return {
          ...comp,
          angle: comp.angle + comp.rotation,
        };
      }
      return comp;
    }),
  })),
});

test("world can contain one type of particle", () => {
  const world: IWorld = {
    paused: false,
    particles: [ball],
    queue: createSystemQueue(),
  };

  expect(world.particles.length).toEqual(1);
});

test("world can contain multiple types of particle", () => {
  const world: IWorld = {
    paused: false,
    particles: [ball, wall],
    queue: createSystemQueue(),
  };

  expect(world.particles.length).toEqual(2);
});

test("system can process a single type", () => {
  const world: IWorld = {
    paused: false,
    particles: [ship],
    queue: createSystemQueue(),
  };

  const newWorld = movementSystem(world);

  expect(newWorld.particles.length).toEqual(1);
  expect(newWorld.particles[0].components.length).toEqual(1);
  expect(getAngle(newWorld.particles[0])?.angle).toEqual(15);
});

test("system can process multiple types", () => {
  const world: IWorld = {
    paused: false,
    particles: [ball, ship],
    queue: createSystemQueue(),
  };

  const newWorld = movementSystem(world);

  expect(newWorld.particles.length).toEqual(2);
  expect(newWorld.particles[1].components.length).toEqual(1);
  expect(getAngle(newWorld.particles[1])?.angle).toEqual(15);
});
