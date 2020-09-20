import {
  worldFactory,
  particleFactory,
  updater,
  movementSystem,
  collisionSystem,
  bounceEventSystem,
  CollisionHandler,
  IPosition,
  IRadius,
  IMovement,
  getPosition,
  ISize,
  getMovement,
} from "./";

const ballFactory = (x: number, y: number) =>
  particleFactory({
    components: [
      { pos: { x, y } } as IPosition,
      { radius: 20 } as IRadius,
      { velocity: { x: 5, y: 5 } } as IMovement,
    ],
  });

test("moves based on velocity", () => {
  const ball = ballFactory(10, 10);

  const { particles } = movementSystem(
    worldFactory({
      particles: [ball],
    })
  );

  expect(particles.length).toEqual(1);
  expect(getPosition(particles[0])?.pos.x).toEqual(15);
  expect(getPosition(particles[0])?.pos.y).toEqual(15);
});

test("detects circle bottom collision", () => {
  const ball = ballFactory(100, 85);
  const wall = particleFactory({
    components: [
      { pos: { x: 50, y: 100 } } as IPosition,
      { size: { width: 100, height: 10 } } as ISize,
    ],
  });

  const world = collisionSystem(bounceEventSystem)(
    worldFactory({
      particles: [ball, wall],
    })
  );

  const { particles } = world.queue.dequeue()!(world);

  expect(particles.length).toEqual(2);
  expect(getPosition(particles[0])?.pos.y).toEqual(80);
  expect(getMovement(particles[0])?.velocity.y).toEqual(-5);
});

test("detects circle top collision", () => {
  const ball = particleFactory({
    components: [
      { pos: { x: 100, y: 25 } } as IPosition,
      { radius: 20 } as IRadius,
      { velocity: { x: 5, y: -5 } } as IMovement,
    ],
  });
  const wall = particleFactory({
    components: [
      { pos: { x: 50, y: 0 } } as IPosition,
      { size: { width: 100, height: 10 } } as ISize,
    ],
  });

  const world = collisionSystem(bounceEventSystem)(
    worldFactory({
      particles: [ball, wall],
    })
  );

  const { particles } = world.queue.dequeue()!(world);

  expect(particles.length).toEqual(2);
  expect(getPosition(particles[0])?.pos.y).toEqual(30);
  expect(getMovement(particles[0])?.velocity.y).toEqual(5);
});

test("detects circle right collision", () => {
  const ball = particleFactory({
    components: [
      { pos: { x: 85, y: 10 } } as IPosition,
      { radius: 20 } as IRadius,
      { velocity: { x: 5, y: -5 } } as IMovement,
    ],
  });
  const wall = particleFactory({
    components: [
      { pos: { x: 100, y: 0 } } as IPosition,
      { size: { width: 10, height: 100 } } as ISize,
    ],
  });

  const world = collisionSystem(bounceEventSystem)(
    worldFactory({
      particles: [ball, wall],
    })
  );

  const { particles } = world.queue.dequeue()!(world);

  expect(particles.length).toEqual(2);
  expect(getPosition(particles[0])?.pos.y).toEqual(10);
  expect(getPosition(particles[0])?.pos.x).toEqual(80);
  expect(getMovement(particles[0])?.velocity.x).toEqual(-5);
});

test("detects circle left collision", () => {
  const ball = particleFactory({
    components: [
      { pos: { x: 25, y: 10 } } as IPosition,
      { radius: 20 } as IRadius,
      { velocity: { x: 5, y: -5 } } as IMovement,
    ],
  });
  const wall = particleFactory({
    components: [
      { pos: { x: 0, y: 0 } } as IPosition,
      { size: { width: 10, height: 100 } } as ISize,
    ],
  });

  const world = collisionSystem(bounceEventSystem)(
    worldFactory({
      particles: [ball, wall],
    })
  );

  const { particles } = world.queue.dequeue()!(world);

  expect(particles.length).toEqual(2);
  expect(getPosition(particles[0])?.pos.y).toEqual(10);
  expect(getPosition(particles[0])?.pos.x).toEqual(30);
  expect(getMovement(particles[0])?.velocity.x).toEqual(-5);
});

test("publishes events on circle collision", () => {
  const ball = particleFactory({
    components: [
      { pos: { x: 100, y: 85 } } as IPosition,
      { radius: 20 } as IRadius,
      { velocity: { x: 5, y: 5 } } as IMovement,
    ],
  });
  const wall = particleFactory({
    components: [
      { pos: { x: 50, y: 100 } } as IPosition,
      { size: { width: 100, height: 10 } } as ISize,
    ],
  });

  const collisionHandler: CollisionHandler = (event) => (world) => {
    expect(event.particle.id).toEqual(wall.id);
    expect(event.collider.id).toEqual(ball.id);
    return bounceEventSystem(event)(world);
  };

  const { queue } = collisionSystem(collisionHandler)(
    worldFactory({
      particles: [ball, wall],
    })
  );

  queue.peek();
  expect(queue.isEmpty()).toBeFalsy();
});

test("publishes collision event after game loop", () => {
  const ball = particleFactory({
    components: [
      { pos: { x: 100, y: 75 } } as IPosition,
      { radius: 20 } as IRadius,
      { velocity: { x: 5, y: 5 } } as IMovement,
    ],
  });
  const wall = particleFactory({
    components: [
      { pos: { x: 50, y: 100 } } as IPosition,
      { size: { width: 100, height: 10 } } as ISize,
    ],
  });

  const collisionHandler: CollisionHandler = (event) => (world) => {
    expect(event.particle.id).toEqual(wall.id);
    expect(event.collider.id).toEqual(ball.id);
    return bounceEventSystem(event)(world);
  };

  const gameLoop = updater([movementSystem, collisionSystem(collisionHandler)]);

  const newWorld = gameLoop(
    worldFactory({
      particles: [ball, wall],
    })
  );

  const { queue } = gameLoop({ ...newWorld });

  queue.peek();
  expect(queue.isEmpty()).toBeFalsy();
});
