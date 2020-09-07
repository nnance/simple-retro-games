import React, { Fragment } from "react";
import { useRouteMatch, Switch, Route } from "react-router-dom";
import { ButtonLink, ColumnLayout } from "../Layout";
import Bounce from "./Bounce";
import Ship from "./Ship";
import Paddle from "./Paddle";

export function Examples() {
  const { url } = useRouteMatch();

  return (
    <Fragment>
      <ButtonLink to={`${url}/bounce`}>Bounce</ButtonLink>
      <br />
      <ButtonLink to={`${url}/paddle`}>Paddle</ButtonLink>
      <br />
      <ButtonLink to={`${url}/ship`}>Ship</ButtonLink>
    </Fragment>
  );
}

export function ExamplesRouter() {
  const { path } = useRouteMatch();

  return (
    <ColumnLayout>
      <Switch>
        <Route exact path={`/examples`} component={Examples} />
        <Route exact path={`${path}/bounce`} component={Bounce} />
        <Route exact path={`${path}/paddle`} component={Paddle} />
        <Route exact path={`${path}/ship`} component={Ship} />
      </Switch>
    </ColumnLayout>
  );
}
