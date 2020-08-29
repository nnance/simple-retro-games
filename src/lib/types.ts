export interface IPoint {
  x: number;
  y: number;
}

export interface IRect {
  width: number;
  height: number;
}

export interface IParticle {
  id: number;
  family?: string;
  pos: IPoint;
  radius?: number;
  size?: IRect;
  velocity?: IPoint;
  points?: [number, number][];
  angle?: number;
  rotation?: number;
  friction?: number;
  thrust?: number;
}

export interface IParticleEvent {
  particle: IParticle;
  collider?: IParticle;
  velocity?: IPoint;
  rotation?: number;
  thrust?: number;
}

export interface IEventQueue {
  enqueue: (event: IParticleEvent) => void;
  dequeue: () => IParticleEvent | undefined;
  peek: () => IParticleEvent | undefined;
  isEmpty: () => boolean;
}

export interface IWorld {
  particles: IParticle[];
  events: IEventQueue;
}

export interface ISystem {
  (world: IWorld): IWorld;
}

export interface IEventSystem {
  (event: IParticleEvent, world: IWorld): IWorld;
}
