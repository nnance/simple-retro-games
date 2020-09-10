import React, { Fragment } from "react";
import { useHistory } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useResize } from "./lib/hooks";
import { IRect } from "./lib";

export function ButtonLink({
  to,
  children,
}: React.PropsWithChildren<{ to: string }>) {
  const history = useHistory();
  return <Button onClick={() => history.push(to)}>{children}</Button>;
}

function TitleBar() {
  return (
    <Navbar bg="dark" variant="dark" fixed="top">
      <Navbar.Brand href="/">React Games</Navbar.Brand>
    </Navbar>
  );
}

export function Layout(props: React.PropsWithChildren<{}>) {
  return (
    <Fragment>
      <TitleBar />
      <Container fluid style={{ height: "100vh", paddingTop: "56px" }}>
        <Row style={{ height: "100%" }}>{props.children}</Row>
      </Container>
    </Fragment>
  );
}

const DEFAULT_SIZE = { width: 100, height: 100 };

const ColSizeContext = React.createContext<
  [IRect, React.Dispatch<React.SetStateAction<IRect>>]
>([DEFAULT_SIZE, () => {}]);

export function useColSize() {
  return React.useContext(ColSizeContext);
}

export function FullHeightCol({ children }: React.PropsWithChildren<{}>) {
  const colRef = React.useRef<HTMLDivElement>(null);
  const [, setSizeState] = React.useContext(ColSizeContext);
  const windowHeight = useResize();

  React.useEffect(() => {
    if (colRef.current) {
      setSizeState({
        width: colRef.current.clientWidth,
        height: colRef.current.clientHeight,
      });
    }
  }, [colRef, setSizeState, windowHeight]);

  return (
    <Col
      ref={colRef}
      md={9}
      style={{
        height: "100%",
        paddingTop: "15px",
        paddingBottom: "15px",
      }}
    >
      {children}
    </Col>
  );
}

export function ColumnLayout({ children }: React.PropsWithChildren<{}>) {
  return (
    <ColSizeContext.Provider value={React.useState<IRect>(DEFAULT_SIZE)}>
      <Col></Col>
      <FullHeightCol>{children}</FullHeightCol>
      <Col></Col>
    </ColSizeContext.Provider>
  );
}
