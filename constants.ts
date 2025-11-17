
import { type BoardState, type SquareName, type PieceType } from './types';

export const KNIGHT_EMOJI: Record<PieceType, string> = {
  white: '♘',
  black: '♞',
};

export const INITIAL_BOARD_STATE: BoardState = {
  '1': 'black', '2': null, '3': 'black', '4': null,
  '5': null,    '6': 'white', '7': null,
  '8': null,    '9': null,
  '10': 'white',
};

export const TARGET_BOARD_STATE: BoardState = {
  '1': 'white', '2': null, '3': 'white', '4': null,
  '5': null,    '6': 'black', '7': null,
  '8': null,    '9': null,
  '10': 'black',
};

export const LEGAL_MOVES: Record<SquareName, SquareName[]> = {
  '1': ['8', '6'],
  '2': ['9', '7'],
  '3': ['8'],
  '4': ['5', '9'],
  '5': ['4'],
  '6': ['1', '10'],
  '7': ['2', '8'],
  '8': ['1', '3', '7'],
  '9': ['2', '4'],
  '10': ['6'],
};

export const BOARD_GRID_LAYOUT: (SquareName | null)[] = [
    null, '10', null, null,
    null, '8',  '9', null,
    null, '5',  '6', '7',
    '1',  '2',  '3', '4',
];

export const SQUARE_COORDS: Record<SquareName, {row: number, col: number}> = {
    '1': {row: 3, col: 0},
    '2': {row: 3, col: 1},
    '3': {row: 3, col: 2},
    '4': {row: 3, col: 3},
    '5': {row: 2, col: 1},
    '6': {row: 2, col: 2},
    '7': {row: 2, col: 3},
    '8': {row: 1, col: 1},
    '9': {row: 1, col: 2},
    '10': {row: 0, col: 1},
};