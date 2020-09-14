import React from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import { ButtonLink, ColumnLayout, Layout } from "./Layout";
import ToolsRouter from "./tools/Router";
import { ExamplesRouter } from "./examples/Router";
import { GamesRouter } from "./games/Router";

export function Home() {
  return (
    <ColumnLayout>
      <ButtonLink to={"/games"}>Games</ButtonLink>
      <br />
      <ButtonLink to={"/examples"}>Examples</ButtonLink>
      <br />
      <ButtonLink to={"/tools"}>Tools</ButtonLink>
    </ColumnLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/tools" component={ToolsRouter} />
          <Route path="/examples" component={ExamplesRouter} />
          <Route path="/games" component={GamesRouter} />
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}
