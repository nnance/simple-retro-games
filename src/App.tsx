import React from "react";
import { IRect } from "./lib";

function App(size: IRect) {
  return (
    <canvas
      style={{ border: "1px solid #ccc", width: "100%", height: "100%" }}
      {...size}
    />
  );
}

export default App;
