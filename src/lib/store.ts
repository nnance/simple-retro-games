import React from "react";
import {
  atom,
  selectorFamily,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import { IParticle } from "./types";

export const particleList = atom<IParticle[]>({
  key: "particleList",
  default: [],
});

export const particleSelector = selectorFamily({
  key: "particleSelector",
  get: (id) => ({ get }) => {
    return get(particleList).find((particle) => particle.id === id);
  },
});

export const useRegisterParticle = (particle: IParticle) => {
  const ref = React.useRef(particle);
  const setList = useSetRecoilState(particleList);

  React.useEffect(() => {
    setList((list) => [...list, ref.current]);
  }, [ref, setList]);

  return useRecoilValue(particleSelector(ref.current.id));
};
