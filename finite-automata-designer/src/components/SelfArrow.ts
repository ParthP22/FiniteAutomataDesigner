import { Circle } from './Circle';

export type SelfArrow = {
  type: 'SelfArrow';
  node: Circle;
  anchorAngle: number;
  color: string;
};

export const createSelfArrow = (
  node: Circle,
  anchorAngle: number,
  color: string
): SelfArrow => ({
  type: 'SelfArrow',
  node,
  anchorAngle,
  color,
});
