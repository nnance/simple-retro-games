import React from "react";

export type GameControls = {
  spaceBar?: () => void;
  leftArrow?: () => void;
  upArrow?: () => void;
  rightArrow?: () => void;
  downArrow?: () => void;
  keyUp?: (keyCode?: number) => void;
};

export enum KeyCode {
  spaceBar = 32,
  leftArrow = 37,
  upArrow = 38,
  rightArrow = 39,
  downArrow = 40,
}

export const useGameControls = (actions: GameControls): void => {
  const handler = React.useCallback(
    ({ keyCode }: KeyboardEvent): void => {
      if (keyCode === KeyCode.upArrow && actions.upArrow) actions.upArrow();
      else if (keyCode === KeyCode.rightArrow && actions.rightArrow)
        actions.rightArrow();
      else if (keyCode === KeyCode.leftArrow && actions.leftArrow)
        actions.leftArrow();
      else if (keyCode === KeyCode.downArrow && actions.downArrow)
        actions.downArrow();
      else if (keyCode === KeyCode.spaceBar && actions.spaceBar)
        actions.spaceBar();
    },
    [actions]
  );

  const downHandler = React.useCallback(
    (e: KeyboardEvent): void => handler(e),
    [handler]
  );

  const upHandler = React.useCallback(
    (e: KeyboardEvent): void => {
      if (actions.keyUp) actions.keyUp(e.keyCode);
    },
    [actions]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return (): void => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [downHandler, upHandler]);
};
