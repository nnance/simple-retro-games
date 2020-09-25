import React from "react";
import { useRouteMatch, Switch, Route } from "react-router-dom";
import { ButtonLink, ColumnLayout } from "../Layout";
import Asteroids from "./Asteroids";
import Breakout from "./Breakout";

export function Games() {
  const { url } = useRouteMatch();

  return (
    <ColumnLayout>
      <ButtonLink to={`${url}/breakout`}>Breakout</ButtonLink>
      <br />
      <ButtonLink to={`${url}/asteroids`}>Asteroids</ButtonLink>
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
      <Route exact path={`${path}/asteroids`} component={Asteroids} />
    </Switch>
  );
}
