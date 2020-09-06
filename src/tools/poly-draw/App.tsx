import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faArrowsAlt } from "@fortawesome/free-solid-svg-icons";
import { useResize } from "../../lib/hooks";
import Grid from "./Grid";
import { Context, StoreProvider, ActionTypes, Point } from "./Store";

const GridCol: React.FC = () => {
  const [size, setSize] = React.useState({ width: 300, height: 300 });
  const colRef = React.useRef<HTMLDivElement>(null);
  const windowHeight = useResize();

  React.useEffect(() => {
    if (colRef.current) {
      const { clientWidth, clientHeight } = colRef.current;
      setSize({ width: clientWidth, height: clientHeight });
    }
  }, [colRef, windowHeight]);

  return (
    <Col
      ref={colRef}
      style={{ height: "100%", paddingTop: "15px", paddingBottom: "15px" }}
    >
      <Grid width={size.width} height={size.height} />
    </Col>
  );
};

const Toolbar: React.FC = () => {
  return (
    <Row>
      <Col style={{ marginLeft: "10px" }}>
        <Button variant="light">
          <FontAwesomeIcon icon={faArrowsAlt} />
        </Button>
        <Button variant="light">
          <FontAwesomeIcon icon={faPencilAlt} />
        </Button>
      </Col>
    </Row>
  );
};

const shapeToString = (shape: Point[]): string => {
  const points = shape.reduce(
    (prev, point) => prev.concat(point.x, point.y),
    [] as number[]
  );
  return JSON.stringify(points);
};

const TextArea: React.FC = () => {
  const [{ zoom, shape }, dispatch] = React.useContext(Context);

  return (
    <Row style={{ height: "75%" }}>
      <Col
        style={{
          paddingLeft: "25px",
          paddingRight: "25px",
          paddingTop: "10px",
          height: "100%",
        }}
      >
        <textarea
          style={{ width: "100%", height: "100%" }}
          value={shapeToString(shape)}
          onChange={({ target }) =>
            dispatch({
              type: ActionTypes.setCode,
              code: target.value,
            })
          }
        ></textarea>
        <input
          type="range"
          min="15"
          max="40"
          value={zoom}
          style={{ width: "100%" }}
          onChange={({ target }) =>
            dispatch({
              type: ActionTypes.setZoom,
              zoom: parseInt(target.value),
            })
          }
        ></input>
      </Col>
    </Row>
  );
};

const ToolsCol: React.FC = () => {
  return (
    <Col
      xs
      lg="3"
      style={{
        height: "100%",
        paddingTop: "15px",
        paddingBottom: "15px",
      }}
    >
      <div style={{ border: "1px solid #ccc", height: "100%" }}>
        <Toolbar />
        <TextArea />
      </div>
    </Col>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <GridCol />
      <ToolsCol />
    </StoreProvider>
  );
};

export default App;
