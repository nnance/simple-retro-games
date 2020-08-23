import React from "react";
import {
  atom,
  selectorFamily,
  useSetRecoilState,
  useRecoilState,
} from "recoil";
import { IParticle, IParticleEvent } from "./types";

export const particleList = atom<IParticle[]>({
  key: "particleList",
  default: [],
});

export const eventList = atom<IParticleEvent[]>({
  key: "particleEvents",
  default: [],
});

export const particleSelector = selectorFamily<IParticle | undefined, number>({
  key: "particleSelector",
  get: (id) => ({ get }) => {
    return get(particleList).find((particle) => particle.id === id);
  },
  set: (id) => ({ set }, particle) => {
    set(particleList, (particles) =>
      particles.map((_) => (_.id === id ? particle : _))
    );
  },
});

export const useRegisterParticle = (particle: IParticle) => {
  const ref = React.useRef(particle);
  const setList = useSetRecoilState(particleList);

  React.useEffect(() => {
    setList((list) => [...list, ref.current]);
  }, [ref, setList]);

  return useRecoilState(particleSelector(ref.current.id));
};

export const eventSelector = selectorFamily<IParticleEvent | undefined, number>(
  {
    key: "eventSelector",
    get: (id) => ({ get }) => {
      return get(eventList).find((event) => event.particle.id === id);
    },
  }
);
