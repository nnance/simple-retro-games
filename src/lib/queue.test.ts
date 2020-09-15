import { createSystemQueue, queueHandler } from "./queue";
import { idFactory, worldFactor } from "./engine";
import { ISystem, IEntity, IPos } from "./types";

const world = worldFactor({
  particles: [
    {
      id: idFactory(),
      family: "ball1",
      pos: { x: 10, y: 10 },
    },
    {
      id: idFactory(),
      family: "ball2",
      pos: { x: 20, y: 20 },
    },
  ],
});

const firstEvent: ISystem = (world) => ({
  ...world,
  particles: world.particles.map((particle) =>
    (particle as IEntity).family === "ball1"
      ? {
          ...particle,
          pos: { x: 0, y: 0 },
        }
      : particle
  ),
});

const secondEvent: ISystem = (world) => ({
  ...world,
  particles: world.particles.map((particle) =>
    (particle as IEntity).family === "ball2"
      ? {
          ...particle,
          pos: { x: 0, y: 0 },
        }
      : particle
  ),
});

test("adding event to queue", () => {
  const events = createSystemQueue();
  events.enqueue(firstEvent);
  expect(events.isEmpty()).toBeFalsy();
});

test("removing event to queue", () => {
  const events = createSystemQueue();
  events.enqueue(firstEvent);
  events.dequeue();
  expect(events.isEmpty()).toBeTruthy();
});

test("first in first out", () => {
  const events = createSystemQueue();
  events.enqueue(firstEvent);
  events.enqueue(secondEvent);
  const event = events.dequeue();
  const newWorld = event!(world);
  const ball = newWorld.particles.find(
    (_) => (_ as IEntity).family === "ball1"
  ) as IPos;
  expect(ball?.pos.x).toEqual(0);
});

test("dequeue empties queue", () => {
  const events = createSystemQueue();
  events.enqueue(firstEvent);
  events.enqueue(secondEvent);
  events.dequeue();
  events.dequeue();
  expect(events.isEmpty()).toBeTruthy();
});

test("queueHandler calls each system for events", () => {
  world.queue.enqueue(firstEvent);
  world.queue.enqueue(secondEvent);

  const newWorld = queueHandler(world);

  expect(world.queue.isEmpty()).toBeTruthy();

  const ball = newWorld.particles.find(
    (_) => (_ as IEntity).family === "ball1"
  ) as IPos;
  expect(ball?.pos.x).toEqual(0);
});
