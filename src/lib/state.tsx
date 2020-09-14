import React from "react";
import { IWorld } from "./types";
import { worldFactory } from "./engine";

const defaultWorld = worldFactory({});

const GameContext = React.createContext<
  [IWorld, React.Dispatch<React.SetStateAction<IWorld>>]
>([defaultWorld, () => {}]);

export const GameProvider = ({
  children,
  ...props
}: React.PropsWithChildren<Partial<IWorld>>) => {
  const state = React.useState<IWorld>({ ...defaultWorld, ...props });

  return <GameContext.Provider value={state}>{children}</GameContext.Provider>;
};

export const useGameContext = () => {
  return React.useContext(GameContext);
};
