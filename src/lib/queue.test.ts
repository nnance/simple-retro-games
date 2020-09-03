import { createEventQueue, eventHandler } from "./queue";
import { idFactory } from "./engine";
import { IEventSystem } from "./types";

const firstEvent = {
  particle: {
    id: idFactory(),
    family: "event1",
    pos: { x: 0, y: 0 },
  },
};

const secondEvent = {
  particle: {
    id: idFactory(),
    family: "event2",
    pos: { x: 0, y: 0 },
  },
};

test("adding event to queue", () => {
  const events = createEventQueue();
  events.enqueue(firstEvent);
  expect(events.isEmpty()).toBeFalsy();
});

test("removing event to queue", () => {
  const events = createEventQueue();
  events.enqueue(firstEvent);
  events.dequeue();
  expect(events.isEmpty()).toBeTruthy();
});

test("first in first out", () => {
  const events = createEventQueue();
  events.enqueue(firstEvent);
  events.enqueue(secondEvent);
  const event = events.dequeue();
  expect(event?.particle.family).toEqual("event1");
});

test("dequeue empties queue", () => {
  const events = createEventQueue();
  events.enqueue(firstEvent);
  events.enqueue(secondEvent);
  events.dequeue();
  const event = events.dequeue();
  expect(event?.particle.family).toEqual("event2");
  expect(events.isEmpty()).toBeTruthy();
});

test("eventHandler calls each system for events", () => {
  let eventFamily;
  const events = createEventQueue();

  events.enqueue(firstEvent);
  events.enqueue(secondEvent);

  const system: IEventSystem = (event, world) => {
    eventFamily = event.particle.family;
    return world;
  };

  const handler = eventHandler([system]);
  handler({ particles: [], events });

  expect(events.isEmpty()).toBeTruthy();
  expect(eventFamily).toEqual("event2");
});
