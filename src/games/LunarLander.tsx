import React from "react";
import { useColSize } from "../Layout";
import {
  GameProvider,
  IRect,
  useAnimationFrame,
  useGameContext,
  worldFactory,
} from "../lib";
import Grid from "../tools/poly-draw/Grid";

// Prepare canvas
const idealHeight = 1080;
const clearPadding = 1; // area to the sides of the lander track to clear, to be sure all trails are deleted
let scalingFactor = 1;
let paused = true;
let restartReadyFrom = new Date().getTime() + 500;
const restartDelay = 1000; // ms until allowed to restart
let lastPhysicsTimestamp = 0;

// Prepare assets
const gravity = 1.62; // m/s/s; Earth is 9.807, Moon is 1.62; Mars is 3.711
// Interface
const interfaceMargin = 25;
const interfaceSpacing = 125;
// Stars
const starDensity = 0.0003;
// Mountains
const mountainDensity = 0.02;
const idealMountainWidth = 200;
const idealMountainHeight = 35;
// Surface
const idealSurfacePosition = 1040;
let surfacePosition = idealSurfacePosition * scalingFactor;
// Lander
const nativeLanderHeight = 135;
const nativeLanderWidth = 160;
const idealLanderScaling = 0.5;
const idealLanderHeight = nativeLanderHeight * idealLanderScaling;
const idealLanderWidth = nativeLanderWidth * idealLanderScaling;
const startLanderAltitude = 900;
const startLanderVelocity = 12;
const startLanderFuel = 100;
const landerThrustPower = 320;
const landerFuelBurnRate = 3.5;
const landerFuelUnitMass = 2550 / startLanderFuel;
const landerMassDry = 2150; // kg
let landerAltitude = startLanderAltitude;
let landerVelocity = startLanderVelocity;
let landerEnginesOn = false;
let landerFuel = startLanderFuel;
let landerMass = landerMassDry + landerFuel * landerFuelUnitMass;
let won, lost;

function drawSurface(context: CanvasRenderingContext2D) {
  const { canvas } = context;
  const vertices = [
    [0, canvas.height - 10],
    [35, canvas.height - 10],
    [60, canvas.height - 145 + 30],
    [107, canvas.height - 114 + 30],
    [134, canvas.height - 114 + 30],
    [150, canvas.height - 58 + 30],
    [210, canvas.height - 58 + 30],
    [253, canvas.height - 86 + 30],
    [299, canvas.height - 98 + 30],
    [378, canvas.height - 98 + 30],
    [420, canvas.height - 140 + 30],
    [476, canvas.height - 163 + 30],
    [530, canvas.height - 81 + 30],
    [578, canvas.height - 81 + 30],
    [642, canvas.height - 106 + 30],
    [738, canvas.height - 98 + 30],
    [757, canvas.height - 81 + 30],
    [913, canvas.height - 123 + 30],
    [963, canvas.height - 83 + 30],
    [1000, canvas.height - 83 + 30],
  ];
  // Clear everything
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineWidth = 2;
  context.strokeStyle = "white";
  // Redraw lunar surface
  context.beginPath();
  vertices.forEach((vert, idx) => {
    if (idx === 0) context.moveTo(vertices[0][0], vertices[0][1]);
    context.lineTo(vert[0], vert[1]);
    context.lineTo(vert[0], vert[1]);
  });
  context.lineTo(canvas.width, canvas.height);
  context.lineTo(0, canvas.height);
  context.lineTo(vertices[0][0], vertices[0][1]);
  context.stroke();
}

// Handle resizing of the browser window
function handleResize(context: CanvasRenderingContext2D) {
  const { canvas } = context;

  // Recalculate sizes
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  scalingFactor = canvas.height / idealHeight;
  surfacePosition = idealSurfacePosition * scalingFactor;
  context.strokeStyle = "white";
  // Clear everything
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineWidth = 2;
  // Redraw stars
  const numStars = Math.round(starDensity * canvas.width * canvas.height);
  context.fillStyle = "white";
  for (let i = 0; i < numStars; i++) {
    const randX = Math.random() * canvas.width;
    const randY = Math.random() * (idealSurfacePosition * scalingFactor);
    context.fillRect(randX, randY, 1, 1);
  }
  // Redraw lunar surface
  context.beginPath();
  context.moveTo(0, surfacePosition);
  context.lineTo(canvas.width, surfacePosition);
  context.stroke();
  // Redraw mountains
  const numMountains = Math.floor(0.5 * canvas.width * mountainDensity);
  context.fillStyle = "black";
  const excludedZoneStart =
    (canvas.width - idealLanderWidth * scalingFactor) / 2; // where NOT to draw mountains
  const excludedZoneEnd = excludedZoneStart + idealLanderWidth * scalingFactor; // where NOT to draw mountains
  let mountainCoords = [];
  // Two passes - first pass strokes the mountains, second pass fills them (so the result is a single perceived line)
  for (let i = 0; i < numMountains; i++) {
    const mountainLeft =
      Math.random() * (canvas.width + idealMountainWidth) - idealMountainWidth;
    const mountainCenter =
      mountainLeft +
      (Math.random() * idealMountainWidth) / 2 +
      idealMountainWidth / 4;
    const mountainRight =
      mountainCenter +
      (Math.random() * idealMountainWidth) / 2 +
      idealMountainWidth / 4;
    const mountainHeight =
      Math.random() * ((idealMountainHeight / 2) * 3) + idealMountainHeight / 3;
    if (
      (mountainLeft < excludedZoneStart &&
        mountainRight >= excludedZoneStart) ||
      (mountainLeft <= excludedZoneEnd && mountainRight > excludedZoneEnd)
    )
      continue;
    context.beginPath();
    context.moveTo(mountainLeft, surfacePosition + 1);
    context.lineTo(
      mountainCenter,
      surfacePosition - mountainHeight * scalingFactor
    );
    context.lineTo(mountainRight, surfacePosition + 1);
    context.stroke();
    mountainCoords.push([
      mountainLeft,
      mountainCenter,
      mountainRight,
      mountainHeight,
    ]);
  }
  for (let i = 0; i < mountainCoords.length; i++) {
    context.beginPath();
    context.moveTo(mountainCoords[i][0], surfacePosition + 2);
    context.lineTo(
      mountainCoords[i][1],
      surfacePosition - mountainCoords[i][3] * scalingFactor
    );
    context.lineTo(mountainCoords[i][2], surfacePosition + 2);
    context.fill();
  }
}

const Board = (props: React.PropsWithChildren<IRect>) => {
  const [size] = useColSize();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      return drawSurface(ctx);
    }
  }, [canvasRef, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ background: "black", width: "100%", height: "100%" }}
      {...size}
    />
  );
};

const LunarLander = () => {
  const [size] = useColSize();

  return (
    <GameProvider>
      <Board {...size} />
    </GameProvider>
  );
};

export default LunarLander;
