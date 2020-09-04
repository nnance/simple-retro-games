import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "react-bootstrap/Navbar";
import Router from "./Router";
import { BrowserRouter } from "react-router-dom";

const useResize = (): number => {
  const [height, setHeight] = React.useState(window.innerHeight);

  React.useEffect(() => {
    const onResize = (): void => setHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return (): void => window.removeEventListener("onresize", onResize);
  });

  return height;
};

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
    <BrowserRouter>
      <Navbar bg="dark" variant="dark" fixed="top">
        <Navbar.Brand href="#home">React Games</Navbar.Brand>
      </Navbar>
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
    </BrowserRouter>
  );
}

export default GameContainer;
