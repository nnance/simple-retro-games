import React from "react";

export type GameControls = {
  spaceBar?: () => void;
  leftArrow?: () => void;
  upArrow?: () => void;
  rightArrow?: () => void;
  downArrow?: () => void;
  keyUp?: () => void;
};

enum KeyCode {
  spaceBar = 32,
  leftArrow = 37,
  upArrow = 38,
  rightArrow = 39,
  downArrow = 40,
}

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
