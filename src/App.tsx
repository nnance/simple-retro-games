import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function App() {
  const colRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (colRef.current && canvasRef.current) {
      canvasRef.current.width = colRef.current.clientWidth;
      canvasRef.current.height = colRef.current.clientHeight;
    }
  }, [colRef, canvasRef]);

  return (
    <div>
      <Container fluid style={{ height: "100vh" }}>
        <Row style={{ height: "100%" }}>
          <Col></Col>
          <Col
            ref={colRef}
            md={9}
            style={{ height: "100%", textAlign: "center" }}
          >
            <canvas ref={canvasRef} />
          </Col>
          <Col></Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
