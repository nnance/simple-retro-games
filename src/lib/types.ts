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
  pos: IPoint;
  radius?: number;
  velocity?: IPoint;
}

export interface ISystem {
  (particles: IParticle[]): IParticle[];
}
