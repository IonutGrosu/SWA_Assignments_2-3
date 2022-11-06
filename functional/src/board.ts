export type Generator<T> = { next: () => T };

export type Position = {
  row: number;
  col: number;
};

export type Match<T> = {
  matched: T;
  positions: Position[];
};

export type Board<T> = {
  width: number;
  height: number;
  tiles: Piece<T>[][];
};

export type Effect<T> = {
  kind: string;
  board?: Board<T>;
  match?: Match<T>;
};

export type MoveResult<T> = {
  board: Board<T>;
  effects: Effect<T>[];
};

type Piece<T> = {
  value: T;
  pos: Position;
};

export function create<T>(
  generator: Generator<T>,
  width: number,
  height: number
): Board<T> {
  return {
    width,
    height,
    tiles: [...Array(height)].map((_, row) =>
      [...Array(width)].map((_, col) => ({
        value: generator.next(),
        pos: {
          row,
          col,
        },
      }))
    ),
  };
}

export function piece<T>(board: Board<T>, p: Position): T | undefined {
  if (isValidPos(board, p)) {
    return board.tiles[p.row][p.col].value;
  }

  return undefined;
}

function isValidPos<T>(board: Board<T>, p: Position): boolean {
  if (p.col < 0 || p.row < 0) {
    return false;
  }

  if (p.col >= board.width || p.row >= board.height) {
    return false;
  }

  return true;
}

export function canMove<T>(
  board: Board<T>,
  first: Position,
  second: Position
): boolean {
  return false;
}

function validateMove<T>(board: Board<T>, first: Position, second: Position) {}

export function move<T>(
  generator: Generator<T>,
  board: Board<T>,
  first: Position,
  second: Position
): MoveResult<T> {
  return undefined;
}
