import React from "react";
import { Switch, Route } from "react-router-dom";
import App from "./App";
import Bounce from "./examples/Bounce";
import Paddle from "./examples/Paddle";
import { IRect } from "./lib";
import Ship from "./examples/Ship";

export default function Router(size: IRect): React.ReactElement {
  return (
    <Switch>
      <Route exact path="/">
        <App {...size} />
      </Route>
      <Route exact path="/bounce">
        <Bounce {...size} />
      </Route>
      <Route exact path="/paddle">
        <Paddle {...size} />
      </Route>
      <Route exact path="/ship">
        <Ship {...size} />
      </Route>
    </Switch>
  );
}
