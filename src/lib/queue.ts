import { ISystem, ISystemQueue } from ".";

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
