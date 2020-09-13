import React from "react";
import { ISystem, IWorld } from "./types";
import { createSystemQueue } from "./queue";

const MAX_NUM = 100000;

export const idFactory = () => Math.floor(Math.random() * MAX_NUM);

export const worldFactor = (world: Partial<IWorld>) => ({
  paused: false,
  particles: [],
  queue: createSystemQueue(),
  ...world,
});

// get a random number within a range
export const random = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export const updater = (systems: ISystem[]) => (world: IWorld): IWorld => {
  const updated = systems.reduce((prev, system) => system(prev), world);
  return updated.paused ? { ...world, paused: true } : updated;
};

export const gameLoop = (update: ISystem, world: IWorld) => {
  let stopFrame: number;

  const loop = (world: IWorld) => {
    const newWorld = update(world);

    stopFrame = requestAnimationFrame(() => {
      loop(newWorld);
    });
  };

  loop(world);
  return () => cancelAnimationFrame(stopFrame);
};

export const useAnimationFrame = (updater: () => void) => {
  const frame = React.useRef(0);

  React.useEffect(() => {
    function loop(): void {
      frame.current = requestAnimationFrame(() => {
        updater();
        loop();
      });
    }
    loop();

    return (): void => cancelAnimationFrame(frame.current);
  }, [updater]);
};
