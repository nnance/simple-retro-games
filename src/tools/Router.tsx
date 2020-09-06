import React from "react";
import { useRouteMatch, Switch, Route } from "react-router-dom";
import PolyDraw from "./poly-draw/App";
import { ColumnLayout, ButtonLink } from "../Layout";

function Tools() {
  const { path } = useRouteMatch();

  return (
    <ColumnLayout>
      <ButtonLink to={`${path}/polydraw`}>Poly Draw</ButtonLink>
    </ColumnLayout>
  );
}

export default function ToolsRouter() {
  const { url } = useRouteMatch();

  return (
    <Switch>
      <Route exact path="/tools" component={Tools} />
      <Route exact path={`${url}/polydraw`} component={PolyDraw} />
    </Switch>
  );
}
