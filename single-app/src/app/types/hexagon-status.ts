import { BoardStatusBase } from './board-status.base';
import {
  Neighbor,
  Position,
  Direction,
  HoleType,
  BoardType,
  HoleStatus,
} from './type';

export class HexagonStatus extends BoardStatusBase {
  override boardType: BoardType = BoardType.hexagon;

  getNeighborPositions(position: Position): Neighbor[] {
    const neighbors: Neighbor[] = [];
    const { col, row } = position;
    const hasHalf = this.holes[position.row][0].type === HoleType.half;
    neighbors.push({
      bypass: new Position(col - 1, row),
      target: new Position(col - 2, row),
      direction: Direction.left,
    });
    neighbors.push({
      bypass: new Position(col + 1, row),
      target: new Position(col + 2, row),
      direction: Direction.right,
    });
    if (hasHalf) {
      // left-top
      neighbors.push({
        bypass: new Position(col - 1, row - 1),
        target: new Position(col - 1, row - 2),
        direction: Direction.upLeft,
      });
      // right-top
      neighbors.push({
        bypass: new Position(col, row - 1),
        target: new Position(col + 1, row - 2),
        direction: Direction.upRight,
      });
      // left-bottom
      neighbors.push({
        bypass: new Position(col - 1, row + 1),
        target: new Position(col - 1, row + 2),
        direction: Direction.downLeft,
      });
      // right-bottom
      neighbors.push({
        bypass: new Position(col, row + 1),
        target: new Position(col + 1, row + 2),
        direction: Direction.downRight,
      });
    } else {
      // left-top
      neighbors.push({
        bypass: new Position(col, row - 1),
        target: new Position(col - 1, row - 2),
        direction: Direction.upLeft,
      });
      // right-top
      neighbors.push({
        bypass: new Position(col + 1, row - 1),
        target: new Position(col + 1, row - 2),
        direction: Direction.upRight,
      });
      // left-bottom
      neighbors.push({
        bypass: new Position(col, row + 1),
        target: new Position(col - 1, row + 2),
        direction: Direction.downLeft,
      });
      // right-bottom
      neighbors.push({
        bypass: new Position(col + 1, row + 1),
        target: new Position(col + 1, row + 2),
        direction: Direction.downRight,
      });
    }
    return neighbors;
  }

  getDirection(dx: number, dy: number): Direction {
    let direction;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const radio = absDx / absDy;
    if (radio > 2) {
      direction = dx > 0 ? Direction.right : Direction.left;
    } else {
      direction =
        dx > 0
          ? dy > 0
            ? Direction.downRight
            : Direction.upRight
          : dy > 0
          ? Direction.downLeft
          : Direction.upLeft;
    }
    return direction;
  }

  expandBoard(): void {
    const edge = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      innerWidth: this.holes[0].length,
      innerHeight: this.holes.length,
    };
    const halfHole = {
      type: HoleType.half,
      status: HoleStatus.normal,
    };
    const tempHole = {
      type: HoleType.temp,
      status: HoleStatus.normal,
    };
    this.holes.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.type > HoleType.empty) {
          const neighbors = this.getNeighborPositions(
            new Position(colIndex, rowIndex)
          );
          neighbors.forEach((neighbor) => {
            const position = neighbor.target;
            if (position.col < edge.left) {
              edge.left = position.col;
            }
            if (position.col > edge.right) {
              edge.right = position.col;
            }
            if (position.row < edge.top) {
              edge.top = position.row;
            }
            if (position.row > edge.bottom) {
              edge.bottom = position.row;
            }
          });
        }
      });
    });
    while (edge.top < 0) {
      const firstRowLength = this.holes[0].length;
      if (firstRowLength !== edge.innerWidth) {
        const newRow = [
          halfHole,
          ...Array(edge.innerWidth - 2).fill(tempHole),
          halfHole,
        ];
        this.holes.unshift(newRow);
      } else {
        this.holes.unshift(Array(edge.innerWidth - 1).fill(tempHole));
      }

      edge.top++;
    }
    while (edge.bottom - edge.innerHeight >= 0) {
      const lastRowLength = this.holes[this.holes.length - 1].length;
      if (lastRowLength !== edge.innerWidth) {
        const newRow = [
          HoleType.half,
          ...Array(edge.innerWidth - 2).fill(tempHole),
          HoleType.half,
        ];
        this.holes.push(newRow);
      } else {
        this.holes.push(Array(edge.innerWidth - 1).fill(tempHole));
      }

      edge.bottom--;
    }
    while (edge.left < 0) {
      this.holes.forEach((row) => {
        const firstCell = row[0];
        if (firstCell.type === HoleType.half) {
          row[0] = tempHole;
          row.unshift(halfHole);
        } else {
          row.unshift(tempHole);
        }
      });
      edge.left++;
    }
    while (edge.right - edge.innerWidth >= -1) {
      this.holes.forEach((row) => {
        const lastCell = row[row.length - 1];
        if (lastCell.type === HoleType.half) {
          row[row.length - 1] = tempHole;
          row.push(halfHole);
        } else {
          row.push(tempHole);
        }
      });
      edge.right--;
    }
  }
}
