import React from "react";
import { useRouteMatch, Switch, Route } from "react-router-dom";
import { ButtonLink, ColumnLayout } from "../Layout";
import Breakout from "./Breakout";

export function Games() {
  const { url } = useRouteMatch();

  return (
    <ColumnLayout>
      <ButtonLink to={`${url}/breakout`}>Breakout</ButtonLink>
      <br />
    </ColumnLayout>
  );
}

export function GamesRouter() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`/games`} component={Games} />
      <Route exact path={`${path}/breakout`} component={Breakout} />
    </Switch>
  );
}
