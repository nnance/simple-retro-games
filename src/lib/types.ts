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
  scale?: number;
  size?: IRect;
  velocity?: IPoint;
  points?: [number, number][];
  angle?: number;
  rotation?: number;
  friction?: number;
  thrust?: number;
  color?: string;
  components: IComponent[];
}

export interface IComponent {
  particle: number;
  family?: string;
}

export interface IPosition extends IComponent {
  pos: IPoint;
}

export interface ISystemQueue {
  enqueue: (event: ISystem) => void;
  dequeue: () => ISystem | undefined;
  peek: () => ISystem | undefined;
  isEmpty: () => boolean;
}

export interface IWorld {
  paused: boolean;
  particles: IParticle[];
  queue: ISystemQueue;
}

export interface ISystem {
  (world: IWorld): IWorld;
}
