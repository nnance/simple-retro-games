import React, { Fragment } from "react";
import { useRouteMatch, Switch, Route } from "react-router-dom";
import { ButtonLink, ColumnLayout } from "../Layout";
import Breakout from "./Breakout";

export function Games() {
  const { url } = useRouteMatch();

  return (
    <Fragment>
      <ButtonLink to={`${url}/breakout`}>Breakout</ButtonLink>
      <br />
    </Fragment>
  );
}

export function GamesRouter() {
  const { path } = useRouteMatch();

  return (
    <ColumnLayout>
      <Switch>
        <Route exact path={`/games`} component={Games} />
        <Route exact path={`${path}/breakout`} component={Breakout} />
      </Switch>
    </ColumnLayout>
  );
}
