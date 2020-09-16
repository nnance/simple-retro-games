import { IParticle, IRadius, IPos, IMovement, IWorld, ISize } from "./types";
import { idFactory } from "./engine";
import { createSystemQueue } from "./queue";

interface IBall extends IParticle, IRadius, IPos, IMovement {}
interface IWall extends IParticle, ISize, IPos {}
type Components = IBall | IWall;

test("world can contain one type of particle", () => {
  const world: IWorld<IBall> = {
    paused: false,
    particles: [
      {
        id: idFactory(),
        family: "ball",
        radius: 20,
        pos: { x: 10, y: 10 },
        velocity: { x: 0, y: 0 },
      },
    ],
    queue: createSystemQueue(),
  };

  expect(world.particles.length).toEqual(1);
});

test("world can contain multiple types of particle", () => {
  const world: IWorld<Components> = {
    paused: false,
    particles: [
      {
        id: idFactory(),
        family: "ball",
        radius: 20,
        pos: { x: 10, y: 10 },
        velocity: { x: 0, y: 0 },
      } as IBall,
      {
        id: idFactory(),
        family: "wall",
        pos: { x: 10, y: 10 },
      } as IWall,
    ],
    queue: createSystemQueue(),
  };

  expect(world.particles.length).toEqual(2);
});
