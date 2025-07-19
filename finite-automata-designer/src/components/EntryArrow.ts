import { Circle } from './Circle';

export type EntryArrow = {
  type: 'EntryArrow';
  node: Circle;
  deltaX: number;
  deltaY: number;
  color: string;
};

export const createEntryArrow = (
  node: Circle,
  deltaX: number,
  deltaY: number,
  color: string
): EntryArrow => ({
  type: 'EntryArrow',
  node,
  deltaX,
  deltaY,
  color,
});
