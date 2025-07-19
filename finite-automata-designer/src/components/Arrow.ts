import { Circle } from './Circle';

export type Arrow = {
  type: 'Arrow';
  nodeA: Circle;
  nodeB: Circle;
  perpendicularPart: number;
  lineAngleAdjust: number;
  color: string;
};

export const createArrow = (
  nodeA: Circle,
  nodeB: Circle,
  perpendicularPart: number,
  lineAngleAdjust: number,
  color: string
): Arrow => ({
  type: 'Arrow',
  nodeA,
  nodeB,
  perpendicularPart,
  lineAngleAdjust,
  color,
});