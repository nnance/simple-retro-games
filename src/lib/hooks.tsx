import React from "react";

export const useResize = (): number => {
  const [height, setHeight] = React.useState(window.innerHeight);

  React.useEffect(() => {
    const onResize = (): void => setHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return (): void => window.removeEventListener("onresize", onResize);
  });

  return height;
};
