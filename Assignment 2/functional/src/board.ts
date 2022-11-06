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

function swap<T>(board: Board<T>, from: Position, to: Position) {
  const temp = board.tiles[from.row][from.col];
  board.tiles[from.row][from.col] = board.tiles[to.row][to.col];
  board.tiles[to.row][to.col] = temp;
}

export function canMove<T>(
  board: Board<T>,
  first: Position,
  second: Position
): boolean {
  return validateMove(board, first, second);
}

function validateMove<T>(
  board: Board<T>,
  first: Position,
  second: Position
): boolean {
  if (!isValidPos(board, first) || !isValidPos(board, second)) {
    return false;
  }

  if (first.col === second.col && first.row === second.row) {
    return false;
  }

  if (first.col !== second.col && first.row !== second.row) {
    return false;
  }

  swap(board, first, second);
  const isValid = verifyBoard(board, first, second);
  swap(board, first, second);
  return isValid;
}

function verifyBoard<T>(
  board: Board<T>,
  first: Position,
  second: Position
): boolean {
  if (first.col === second.col) {
    return verifyVertical(board, first, second);
  }

  if (first.row === second.row) {
    return verifyHorizontal(board, first, second);
  }

  return false;
}

function verifyVertical<T>(board: Board<T>, first: Position, second: Position) {
  const firstPiece = piece(board, first);
  const secondPiece = piece(board, second);

  const colIdx = first.col;
  const firstRowIdx = first.row;
  const secondRowIdx = second.row;

  const colMatches = matchesForCol(board, colIdx, firstPiece);
  const colMatchesSecondPiece = matchesForCol(board, colIdx, secondPiece);
  const firstRowMatches = matchesForRow(board, firstRowIdx, firstPiece);
  const secondRowMatches = matchesForRow(board, secondRowIdx, secondPiece);

  if (
    colMatches.length >= 3 ||
    colMatchesSecondPiece.length >= 3 ||
    firstRowMatches.length >= 3 ||
    secondRowMatches.length >= 3
  ) {
    return true;
  }

  return false;
}

function verifyHorizontal<T>(
  board: Board<T>,
  first: Position,
  second: Position
) {
  const firstPiece = piece(board, first);
  const secondPiece = piece(board, second);

  const rowIdx = first.row;
  const firstColIdx = first.col;
  const secondColIdx = second.col;

  const rowMatches = matchesForRow(board, rowIdx, firstPiece);
  const rowMatchesSecondPiece = matchesForRow(board, rowIdx, secondPiece);
  const firstColMatches = matchesForCol(board, firstColIdx, firstPiece);
  const secondColMatches = matchesForCol(board, secondColIdx, secondPiece);

  if (
    rowMatches.length >= 3 ||
    rowMatchesSecondPiece.length >= 3 ||
    firstColMatches.length >= 3 ||
    secondColMatches.length >= 3
  ) {
    return true;
  }

  return false;
}

function matchesForRow<T>(board: Board<T>, rowIdx: number, piece: T) {
  let positions: Position[] = [];
  const row = board.tiles[rowIdx];

  let temp: Position[] = [];

  for (let i = 0; i < row.length; i++) {
    if (row[i].value === piece) {
      temp.push({ row: rowIdx, col: i });
    } else {
      temp = [];
    }

    if (temp.length > positions.length) {
      positions = temp;
    }
  }

  return positions;
}

function matchesForCol<T>(board: Board<T>, colIdx: number, piece: T) {
  let positions: Position[] = [];
  const column = board.tiles.map((row) => row[colIdx]);

  let temp: Position[] = [];

  for (let i = 0; i < column.length; i++) {
    if (column[i].value === piece) {
      temp.push({ row: i, col: colIdx });
    } else {
      temp = [];
    }

    if (temp.length > positions.length) {
      positions = temp;
    }
  }

  return positions;
}

export function move<T>(
  generator: Generator<T>,
  board: Board<T>,
  first: Position,
  second: Position
): MoveResult<T> {
  if (validateMove(board, first, second)) {
    swap(board, first, second);

    return {
      board,
      effects: [],
    };
  }

  return {
    board,
    effects: [],
  };
}
