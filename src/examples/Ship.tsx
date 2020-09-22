import React from "react";
import {
  IParticle,
  updater,
  movementSystem,
  renderer,
  gameLoop,
  polygonSystem,
  gameControls,
  KeyCode,
  random,
  IRect,
  ISystem,
  collisionSystem,
  CollisionHandler,
  createSystemQueue,
  queueHandler,
  worldFactory,
  particleFactory,
  IAngle,
  IPoints,
  IPosition,
  IRadius,
  IMovement,
  IThrust,
  isPosition,
  isThrust,
  isAngle,
} from "../lib";
import { useColSize } from "../Layout";

const FPS = 60;
const SHOW_BOUNDING = false;
const SHIP_SIZE = 10;
const SHIP_SCALE = 3;
const ASTEROIDS_SIZE = [40, 20, 10]; // size in pixel per stage
const ASTEROIDS_SCALE = [10, 5, 2]; // size in pixel per stage
const ASTEROIDS_SPEED = 3; // max starting speed in pixels per sec
const TURN_SPEED = 180; // deg per second
const SHIP_THRUST = 5; // acceleration of the ship in pixels per sec
const FRICTION = 0.7; // friction coefficient of space. (0 = no friction, 1 = full friction)
const ASTEROIDS = [
  [
    [-4, -2],
    [-2, -4],
    [0, -2],
    [2, -4],
    [4, -2],
    [3, 0],
    [4, 2],
    [1, 4],
    [-2, 4],
    [-4, 2],
    [-4, -2],
  ],
  [
    [-3, 0],
    [-4, -2],
    [-2, -4],
    [0, -3],
    [2, -4],
    [4, -2],
    [2, -1],
    [4, 1],
    [2, 4],
    [-1, 3],
    [-2, 4],
    [-4, 2],
    [-3, 0],
  ],
  [
    [-2, 0],
    [-4, -1],
    [-1, -4],
    [2, -4],
    [4, -1],
    [4, 1],
    [2, 4],
    [0, 4],
    [0, 1],
    [-2, 4],
    [-4, 1],
    [-2, 0],
  ],
  [
    [-1, -2],
    [-2, -4],
    [1, -4],
    [4, -2],
    [4, -1],
    [1, 0],
    [4, 2],
    [2, 4],
    [1, 3],
    [-2, 4],
    [-4, 1],
    [-4, -2],
    [-1, -2],
  ],
  [
    [-4, -2],
    [-2, -4],
    [2, -4],
    [4, -2],
    [4, 2],
    [2, 4],
    [-2, 4],
    [-4, 2],
    [-4, -2],
  ],
] as [number, number][][];

const asteroidFactory = (stage: number, { width }: IRect): IParticle[] => {
  const velocity = () => random(ASTEROIDS_SPEED * -1, ASTEROIDS_SPEED);

  return ASTEROIDS.map((points) =>
    particleFactory({
      family: "asteroid",
      components: [
        { pos: { x: random(0, width), y: random(0, width) } } as IPosition,
        { radius: Math.ceil(ASTEROIDS_SIZE[stage - 1]) } as IRadius,
        { scale: Math.ceil(ASTEROIDS_SCALE[stage - 1]), points } as IPoints,
        { velocity: { x: velocity(), y: velocity() } } as IMovement,
        { angle: 0, rotation: 0 } as IAngle,
      ],
    })
  );
};

const particlesFactory = (size: IRect): IParticle[] => {
  const ship = particleFactory({
    family: "ship",
    components: [
      { pos: { x: 200, y: 200 } } as IPosition,
      { radius: SHIP_SIZE } as IRadius,
      { velocity: { x: 0, y: 0 } } as IMovement,
      { friction: FRICTION, thrust: 0 } as IThrust,
      {
        scale: SHIP_SCALE,
        points: [
          [0, -6],
          [-3, 3],
          [0, 1],
          [3, 3],
          [0, -6],
        ],
      } as IPoints,
      { angle: 0, rotation: 0 } as IAngle,
    ],
  });
  const belt = asteroidFactory(1, size);

  return [ship, ...belt];
};

const offScreenSystem = (size: IRect): ISystem => (world) => {
  const particles = world.particles.map((particle) => ({
    ...particle,
    components: particle.components.map((component) => {
      return isPosition(component)
        ? ({
            pos: {
              x:
                component.pos.x < 0
                  ? size.width
                  : component.pos.x > size.width
                  ? 0
                  : component.pos.x,
              y:
                component.pos.y < 0
                  ? size.height
                  : component.pos.y > size.height
                  ? 0
                  : component.pos.y,
            },
          } as IPosition)
        : component;
    }),
  }));
  return { ...world, particles };
};

const shipCollisionSystem: CollisionHandler = (event): ISystem => (world) => {
  if (
    event.collider &&
    event.collider.family === "asteroid" &&
    event.particle.family === "ship"
  ) {
    const particles = world.particles.reduce((prev, particle) => {
      const hit = event.collider?.id === particle.id;
      return hit ? prev : [...prev, particle];
    }, [] as IParticle[]);

    return { ...world, particles };
  }
  return world;
};

const startGame = (ctx: CanvasRenderingContext2D, size: IRect) => {
  const particles = particlesFactory(size);
  const queue = createSystemQueue();

  const updateShip = (value: Partial<IAngle> | Partial<IThrust>) => () => {
    queue.enqueue((world) => {
      const particles = world.particles.map((particle) =>
        particle.family === "ship"
          ? {
              ...particle,
              components: particle.components.map((component) => {
                if (isThrust(value) && isThrust(component)) {
                  return { ...component, ...value };
                } else if (isAngle(value) && isAngle(component)) {
                  return { ...component, ...value };
                }
                return component;
              }),
            }
          : particle
      );
      return { ...world, particles };
    });
  };

  const cancelControls = gameControls({
    leftArrow: updateShip({ rotation: ((TURN_SPEED / 180) * Math.PI) / FPS }),
    rightArrow: updateShip({ rotation: ((-TURN_SPEED / 180) * Math.PI) / FPS }),
    upArrow: updateShip({ thrust: SHIP_THRUST }),
    keyUp: (keyCode = 0) => {
      if ([KeyCode.leftArrow, KeyCode.rightArrow].includes(keyCode)) {
        updateShip({ rotation: 0 })();
      } else if (keyCode === KeyCode.upArrow) {
        updateShip({ thrust: 0 })();
      }
    },
    pause: () =>
      queue.enqueue((world) => ({ ...world, paused: !world.paused })),
  });

  const collisionHandler: CollisionHandler = (event) => (world) => {
    return shipCollisionSystem(event)(world);
  };

  const update = updater([
    movementSystem,
    collisionSystem(collisionHandler),
    queueHandler,
    offScreenSystem(size),
    renderer(ctx, [polygonSystem(SHOW_BOUNDING)]),
  ]);

  const cancelLoop = gameLoop(
    update,
    worldFactory({ paused: false, particles, queue })
  );

  return () => {
    cancelControls();
    cancelLoop();
  };
};

const Ship = () => {
  const [size] = useColSize();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    if (ctx) startGame(ctx, size);
  }, [canvasRef, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ background: "black", width: "100%", height: "100%" }}
      {...size}
    />
  );
};

export default Ship;
