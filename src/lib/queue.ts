import {
  IEventQueue,
  IParticleEvent,
  IEventSystem,
  ISystem,
  ISystemQueue,
} from ".";

export const createEventQueue = (): IEventQueue => {
  const events: IParticleEvent[] = [];

  return {
    enqueue: (event: IParticleEvent) => events.push(event),
    dequeue: () => events.shift(),
    peek: () => (events.length > 0 ? events[0] : undefined),
    isEmpty: () => events.length === 0,
  };
};

export const eventHandler = (systems: IEventSystem[]): ISystem => (world) => {
  let result = world;
  while (!world.events.isEmpty()) {
    const event = world.events.dequeue();
    result = event
      ? systems.reduce((prev, system) => system(event, prev), result)
      : world;
  }
  return result;
};

export const queueHandler: ISystem = (world) => {
  let result = world;
  while (!world.queue!.isEmpty()) {
    const event = world.queue!.dequeue();
    if (event) result = event(result);
  }
  return result;
};

export const createSystemQueue = (): ISystemQueue => {
  const events: ISystem[] = [];

  return {
    enqueue: (event: ISystem) => events.push(event),
    dequeue: () => events.shift(),
    peek: () => (events.length > 0 ? events[0] : undefined),
    isEmpty: () => events.length === 0,
  };
};
