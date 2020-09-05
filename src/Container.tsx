import React, { Fragment } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Router from "./Router";
import TitleBar from "./TitleBar";
import { useResize } from "./lib/hooks";

function GameContainer(props: React.PropsWithChildren<{}>) {
  const colRef = React.useRef<HTMLDivElement>(null);
  const [sizeState, setSizeState] = React.useState({ width: 100, height: 100 });
  const windowHeight = useResize();

  React.useEffect(() => {
    if (colRef.current) {
      setSizeState({
        width: colRef.current.clientWidth,
        height: colRef.current.clientHeight,
      });
    }
  }, [colRef, windowHeight]);

  return (
    <Fragment>
      <TitleBar />
      <Container fluid style={{ height: "100vh", paddingTop: "56px" }}>
        <Row style={{ height: "100%" }}>
          <Col></Col>
          <Col
            ref={colRef}
            md={9}
            style={{
              height: "100%",
              paddingTop: "15px",
              paddingBottom: "15px",
            }}
          >
            <Router {...sizeState} />
          </Col>
          <Col></Col>
        </Row>
      </Container>
    </Fragment>
  );
}

export default GameContainer;
