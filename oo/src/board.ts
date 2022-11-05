export type Generator<T> = { next: () => T };

export type Position = {
  row: number;
  col: number;
};

export enum DIRECTION {
  UP = `Up`,
  DOWN = `Down`,
  LEFT = `Left`,
  RIGHT = `Right`,
}

export type Match<T> = {
  matched: T;
  positions: Position[];
};

export type Piece<T> = {
  value: T;
  position: Position;
};

export type BoardEvent<T> = {
  kind: `Match` | `Refill`;
  match?: Match<T>;
};

export type BoardListener<T> = (event: BoardEvent<T>) => {};

export class Board<T> {
  width: number;
  height: number;

  generator: Generator<T>;
  pieces: Piece<T>[] = [];

  eventsEnabled: boolean = false;
  listeners: BoardListener<T>[] = [];

  constructor(generator: Generator<T>, columns: number, rows: number) {
    this.width = columns;
    this.height = rows;
    this.generator = generator;

    this.fillBoard();

    (this.pieces as any).swapProperties = (
      firstIndex: number,
      secondIndex: number,
      propertyToSwap: string
    ) => {
      const firstPieceValue = this.pieces[firstIndex][propertyToSwap];
      const secondPieceValue = this.pieces[secondIndex][propertyToSwap];
      this.pieces[firstIndex][propertyToSwap] = secondPieceValue;
      this.pieces[secondIndex][propertyToSwap] = firstPieceValue;
    };
  }

  //    GIVEN FUNCTIONS
  addListener(listener: BoardListener<T>) {
    this.listeners.push(listener);
  }

  piece(p: Position): T | undefined {
    if (!this.isPositionOutsideBoard(p)) {
      return undefined;
    }
    return this.getPieceOnPos(p).value;
  }

  canMove(first: Position, second: Position): boolean {
    return this.isLegalMove(first, second);
  }

  move(first: Position, second: Position): boolean {
    if (this.isLegalMove(first, second)) {
      this.eventsEnabled = true;
      this.switchPieces(first, second);
      this.scanBoard();
      this.eventsEnabled = false;
    }
    return null;
  }
  //    END OF GIVEN FUNCTIONS

  fillBoard(): void {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        this.pieces.push({
          value: this.generator.next(),
          position: {
            row,
            col,
          },
        });
      }
    }
  }

  isPositionOutsideBoard(p: Position): boolean {
    if (p.col >= this.width || p.col < 0) {
      return false;
    }

    if (p.row >= this.height || p.row < 0) {
      return false;
    }
    return true;
  }

  getPieceOnPos(position: Position): Piece<T> {
    return this.pieces.find((element) => {
      return (
        element.position.col == position.col &&
        element.position.row == position.row
      );
    });
  }

  isLegalMove(firstPosition: Position, secondPosition: Position): boolean {
    if (
      !this.isPositionOutsideBoard(firstPosition) ||
      !this.isPositionOutsideBoard(secondPosition)
    ) {
      return false;
    }
    if (
      firstPosition.col === secondPosition.col &&
      firstPosition.row === secondPosition.row
    ) {
      return false;
    }

    if (
      firstPosition.col !== secondPosition.col &&
      firstPosition.row !== secondPosition.row
    ) {
      return false;
    }

    this.switchPieces(firstPosition, secondPosition);
    const matchesInRow = this.getAllRowMatches();
    const matchesInColumn = this.getColumnMatches();
    this.switchPieces(firstPosition, secondPosition);

    if (!matchesInRow.length && !matchesInColumn.length) {
      return false;
    }
    return true;
  }

  switchPieces(firstPos: Position, secondPos: Position) {
    const firstPiece = this.getPieceOnPos(firstPos);
    const secondPiece = this.getPieceOnPos(secondPos);

    const firstIndex = this.pieces.indexOf(firstPiece);
    const secondIndex = this.pieces.indexOf(secondPiece);

    (this.pieces as any).swapProperties(firstIndex, secondIndex, `value`);
  }

  getAllRowMatches() {
    let matches: Piece<T>[] = [];
    for (let i = 0; i < this.height; i++) {
      const elementsInRow = this.getAllPiecesInRow(i);
      for (const element of elementsInRow) {
        if (!matches.includes(element)) {
          matches = matches.concat(this.deepNeighbourCheckOnRow(element));
        }
      }
    }
    return matches;
  }

  getColumnMatches() {
    let matches: Piece<T>[] = [];
    for (let i = this.width; i >= 0; i--) {
      const elementsInColumn = this.getAllPiecesInColumn(i);
      for (const element of elementsInColumn) {
        if (!matches.includes(element)) {
          matches = matches.concat(this.deepNeighbourCheckOnColumn(element));
        }
      }
    }
    return matches;
  }

  getAllPiecesInRow(rowIndex: number): Piece<T>[] {
    return this.pieces.filter((element) => {
      return element.position.row === rowIndex;
    });
  }

  getAllPiecesInColumn(columnIndex: number): Piece<T>[] {
    return this.pieces.filter((element) => {
      return element.position.col === columnIndex;
    });
  }

  deepNeighbourCheckOnRow(startPiece: Piece<T>) {
    const leftSideElements = this.findChainOfValues(
      this.getPieceOnPos(
        this.findNextPiecePosition(startPiece, DIRECTION.LEFT)
      ),
      [],
      startPiece.value,
      DIRECTION.LEFT
    );
    const rightSideElements = this.findChainOfValues(
      this.getPieceOnPos(
        this.findNextPiecePosition(startPiece, DIRECTION.RIGHT)
      ),
      [],
      startPiece.value,
      DIRECTION.RIGHT
    );

    if (leftSideElements.length + rightSideElements.length + 1 >= 3) {
      const matchedPieces = [
        ...leftSideElements,
        startPiece,
        ...rightSideElements,
      ];

      if (this.eventsEnabled) {
        this.dispatchMatchEventToListeners(matchedPieces);
      }
      return matchedPieces;
    }

    return [];
  }

  deepNeighbourCheckOnColumn(startPiece: Piece<T>) {
    const nextTopPosition = this.findNextPiecePosition(
      startPiece,
      DIRECTION.UP
    );
    const pieceOnNextTopPosition = this.getPieceOnPos(nextTopPosition);
    const topElements = this.findChainOfValues(
      pieceOnNextTopPosition,
      [],
      startPiece.value,
      DIRECTION.UP
    );
    const downElements = this.findChainOfValues(
      this.getPieceOnPos(
        this.findNextPiecePosition(startPiece, DIRECTION.DOWN)
      ),
      [],
      startPiece.value,
      DIRECTION.DOWN
    );

    if (topElements.length + downElements.length + 1 >= 3) {
      const matchedPieces = [...topElements, startPiece, ...downElements];
      if (this.eventsEnabled) {
        this.dispatchMatchEventToListeners(matchedPieces);
      }
      return matchedPieces;
    }

    return [];
  }

  findChainOfValues(
    currentPiece: Piece<T>,
    matchingPieces: Piece<T>[],
    value: T,
    checkDirection: DIRECTION
  ): Piece<T>[] {
    if (!currentPiece) {
      return matchingPieces;
    }
    if (currentPiece.value === value) {
      matchingPieces.push(currentPiece);
      const nextPiece = this.getPieceOnPos(
        this.findNextPiecePosition(currentPiece, checkDirection)
      );
      this.findChainOfValues(nextPiece, matchingPieces, value, checkDirection);
    }
    return matchingPieces;
  }

  findNextPiecePosition(
    currentPiece: Piece<T>,
    direction: DIRECTION
  ): Position {
    let position: Position = {
      row: currentPiece.position.row,
      col: currentPiece.position.col,
    };
    if (direction === DIRECTION.DOWN) {
      position.row += 1;
    }

    if (direction === DIRECTION.UP) {
      position.row -= 1;
    }

    if (direction === DIRECTION.LEFT) {
      position.col -= 1;
    }

    if (direction === DIRECTION.RIGHT) {
      position.col += 1;
    }
    return position;
  }

  dispatchMatchEventToListeners(matchedPieces: Piece<T>[]) {
    this.listeners.forEach((listener) => {
      listener({
        kind: `Match`,
        match: {
          matched: { ...matchedPieces[0] }.value,
          positions: matchedPieces.map((match) => match.position),
        },
      });
    });
  }

  scanBoard() {
    const allRowMatches = this.getAllRowMatches();
    const allColumnMatches = this.getColumnMatches();
    if (allColumnMatches.length || allRowMatches.length) {
      this.removeMatchedPieces(allRowMatches, allColumnMatches);
      this.refillBoard();
    }
  }

  removeMatchedPieces(
    matchesRows: Piece<T>[],
    matchesColumn: Piece<T>[]
  ): void {
    matchesRows.forEach((match) => {
      match.value = undefined;
    });
    matchesColumn.forEach((match) => {
      match.value = undefined;
    });
  }

  refillBoard(): void {
    this.listeners.forEach((listener) => {
      listener({
        kind: `Refill`,
      });
    });

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const foundElement = this.getPieceOnPos({ row, col });
        if (foundElement.value === undefined) {
          this.shiftElementsDown(
            foundElement.position.row,
            foundElement.position.col
          );
          this.getPieceOnPos({
            row: 0,
            col: foundElement.position.col,
          }).value = this.generator.next();
        }
      }
    }

    // scanning recursively for new matches
    this.scanBoard();
  }

  shiftElementsDown(fromRow: number, col: number): void {
    for (let row = fromRow; row > 0; row--) {
      this.switchPieces({ row, col }, { row: row - 1, col });
    }
  }
}
