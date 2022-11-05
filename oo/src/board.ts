export type Generator<T> = { next: () => T };

export type Position = {
  row: number;
  col: number;
};

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

export type BoardListener<T> = {};

export class Board<T> {
  width: number;
  height: number;

  generator: Generator<T>;
  pieces: Piece<T>[] = [];

  constructor(generator: Generator<T>, columns: number, rows: number) {
    this.width = columns;
    this.height = rows;
    this.generator = generator;

    this.fillBoard();
  }

  //    GIVEN FUNCTIONS
  addListener(listener: BoardListener<T>) {}

  piece(p: Position): T | undefined {
    if (!this.isPositionOutsideBoard(p)) {
      return undefined;
    }
    return this.getPieceOnPosition(p).value;
  }

  canMove(first: Position, second: Position): boolean {
    return false;
  }

  move(first: Position, second: Position) {}
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

  getPieceOnPosition(position: Position): Piece<T> {
    return this.pieces.find((element) => {
      return (
        element.position.col == position.col &&
        element.position.row == position.row
      );
    });
  }
}
