import React, { Fragment } from "react";
import { useRouteMatch, Switch, Route } from "react-router-dom";
import { ButtonLink, ColumnLayout } from "../Layout";
import Bounce from "./Bounce";
import BounceContext from "./BounceContext";
import Paddle from "./Paddle";
import PaddleContext from "./PaddleContext";
import Ship from "./Ship";

export function Examples() {
  const { url } = useRouteMatch();

  return (
    <Fragment>
      <ButtonLink to={`${url}/bounce`}>Bounce</ButtonLink>
      <br />
      <ButtonLink to={`${url}/bounce-context`}>Bounce Context</ButtonLink>
      <br />
      <ButtonLink to={`${url}/paddle`}>Paddle</ButtonLink>
      <br />
      <ButtonLink to={`${url}/paddle-context`}>Paddle Context</ButtonLink>
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
        <Route
          exact
          path={`${path}/bounce-context`}
          component={BounceContext}
        />
        <Route exact path={`${path}/paddle`} component={Paddle} />
        <Route
          exact
          path={`${path}/paddle-context`}
          component={PaddleContext}
        />
        <Route exact path={`${path}/ship`} component={Ship} />
      </Switch>
    </ColumnLayout>
  );
}
