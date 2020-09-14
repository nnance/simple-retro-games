import React from "react";

export type GameControls = {
  spaceBar?: () => void;
  leftArrow?: () => void;
  upArrow?: () => void;
  rightArrow?: () => void;
  downArrow?: () => void;
  pause?: () => void;
  keyUp?: (keyCode?: number) => void;
};

export enum KeyCode {
  spaceBar = 32,
  leftArrow = 37,
  upArrow = 38,
  rightArrow = 39,
  downArrow = 40,
  pause = 80,
}

export const gameControls = (actions: GameControls) => {
  const downHandler = ({ keyCode }: KeyboardEvent): void => {
    if (keyCode === KeyCode.upArrow && actions.upArrow) actions.upArrow();
    else if (keyCode === KeyCode.rightArrow && actions.rightArrow)
      actions.rightArrow();
    else if (keyCode === KeyCode.leftArrow && actions.leftArrow)
      actions.leftArrow();
    else if (keyCode === KeyCode.downArrow && actions.downArrow)
      actions.downArrow();
    else if (keyCode === KeyCode.spaceBar && actions.spaceBar)
      actions.spaceBar();
    else if (keyCode === KeyCode.pause && actions.pause) actions.pause();
  };

  const upHandler = ({ keyCode }: KeyboardEvent): void => {
    if (actions.keyUp) actions.keyUp(keyCode);
  };

  window.addEventListener("keydown", downHandler);
  window.addEventListener("keyup", upHandler);

  return () => {
    window.removeEventListener("keydown", downHandler);
    window.removeEventListener("keyup", upHandler);
  };
};

export const useGameControls = (actions: GameControls): void => {
  const [state, setState] = React.useState(0);

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
      else if (keyCode === KeyCode.pause && actions.pause) actions.pause();
      setState(keyCode);
    },
    [actions]
  );

  const downHandler = React.useCallback(
    (e: KeyboardEvent): void => {
      if (!actions.keyUp) {
        handler(e);
      } else if (state === 0) {
        handler(e);
      }
    },
    [handler, actions, state]
  );

  const upHandler = React.useCallback((): void => {
    if (actions.keyUp) actions.keyUp();
    setState(0);
  }, [actions, setState]);

  React.useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return (): void => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [downHandler, upHandler]);
};
