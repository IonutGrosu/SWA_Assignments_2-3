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
    return verifyVertical(board, first, second).valid;
  }

  if (first.row === second.row) {
    return verifyHorizontal(board, first, second).valid;
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

  const matches = [
    colMatches,
    colMatchesSecondPiece,
    firstRowMatches,
    secondRowMatches,
  ];

  if (matches.some((item) => item.length >= 3)) {
    return {
      valid: true,
      matches: matches,
    };
  }

  return {
    valid: false,
    matches: [],
  };
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

  const matches = [
    rowMatches,
    rowMatchesSecondPiece,
    firstColMatches,
    secondColMatches,
  ];

  if (matches.some((item) => item.length >= 3)) {
    return {
      valid: true,
      matches: matches,
    };
  }

  return {
    valid: false,
    matches: matches,
  };
}

function matchesForRow<T>(board: Board<T>, rowIdx: number, piece: T) {
  let positions: Piece<T>[] = [];
  const row = board.tiles[rowIdx];

  let temp: Piece<T>[] = [];

  for (let i = 0; i < row.length; i++) {
    if (row[i].value === piece) {
      temp.push({ pos: { row: rowIdx, col: i }, value: piece });
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
  let positions: Piece<T>[] = [];
  const column = board.tiles.map((row) => row[colIdx]);

  let temp: Piece<T>[] = [];

  for (let i = 0; i < column.length; i++) {
    if (column[i].value === piece) {
      temp.push({ pos: { row: i, col: colIdx }, value: piece });
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
    const effects: Effect<T>[] = [];
    clearBoard(board, generator, effects);

    return {
      board,
      effects,
    };
  }

  return {
    board,
    effects: [],
  };
}

function buildEvents<T>(matches: Piece<T>[]) {
  return {
    effects: [
      {
        kind: "Match",
        match: {
          matched: matches[0].value,
          positions: matches.map((piece) => piece.pos),
        },
      },
    ],
    matches: matches,
  };
}

function clearBoard<T>(
  board: Board<T>,
  generator: Generator<T>,
  effects: Effect<T>[]
) {
  const rowsMatched = allRowsMatched(board);
  const colsMatched = allColsMatched(board);

  effects.push(...rowsMatched.effects, ...colsMatched.effects);

  if (rowsMatched.matches.length > 0 || colsMatched.matches.length > 0) {
    rowsMatched.matches.forEach((match) => {
      board.tiles.forEach((row) =>
        row.forEach((item) => {
          if (item.pos === match.pos) {
            item.value = undefined;
            match.value = undefined;
          }
        })
      );
    });
    colsMatched.matches.forEach((match) => {
      board.tiles.forEach((row) =>
        row.forEach((item) => {
          if (item.pos === match.pos) {
            item.value = undefined;
            match.value = undefined;
          }
        })
      );
    });

    refillBoard(board, generator, effects);
  }
}

function allRowsMatched<T>(board: Board<T>) {
  let matches: Piece<T>[] = [];
  let effects: Effect<T>[] = [];

  for (let i = 0; i < board.height; i++) {
    const checked: T[] = [];
    const elements = board.tiles[i];

    elements.forEach((element) => {
      if (!checked.includes(element.value)) {
        checked.push(element.value);
        const res = buildEvents(matchesForRow(board, i, element.value));

        matches = matches.concat(res.matches);
        effects = effects.concat(res.effects);
      }
    });
  }

  return {
    matches,
    effects,
  };
}

function allColsMatched<T>(board: Board<T>) {
  let matches: Piece<T>[] = [];
  let effects: Effect<T>[] = [];

  for (let i = board.width - 1; i >= 0; i--) {
    const checked: T[] = [];
    const elements = board.tiles.map((row) => row[i]);

    elements.forEach((element) => {
      if (!checked.includes(element.value)) {
        checked.push(element.value);
        const res = buildEvents(matchesForCol(board, i, element.value));

        matches = matches.concat(res.matches);
        effects = effects.concat(res.effects);
      }
    });
  }

  return {
    matches,
    effects,
  };
}

function refillBoard<T>(
  board: Board<T>,
  generator: Generator<T>,
  effects: Effect<T>[]
) {
  board.tiles.forEach((row, rowIdx) => {
    row.forEach((item, colIdx) => {
      if (item.value === undefined) {
        shiftColumn(board, rowIdx, colIdx);
        item.value = generator.next();
      }
    });
  });

  effects.push({
    kind: "Refill",
    board,
  });

  clearBoard(board, generator, effects);
}

function shiftColumn<T>(board: Board<T>, rowIdx: number, colIdx: number) {
  for (let row = rowIdx - 1; row >= 0; row--) {
    swap(board, { row: row, col: colIdx }, { row: row - 1, col: colIdx });
  }
}
