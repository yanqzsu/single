import { isOutrange } from '../../util/util';
import { BoardStatusBase } from './board-status.base';
import {
  Neighbor,
  Position,
  Direction,
  BoardType,
  HoleType,
  HoleStatus,
} from '../type';

export class OctagonStatus extends BoardStatusBase {
  override boardType: BoardType = BoardType.octagon;

  getNeighborPositions(position: Position): Neighbor[] {
    const neighbors: Neighbor[] = [];
    const { col, row } = position;
    neighbors.push({
      bypass: new Position(col, row - 1),
      target: new Position(col, row - 2),
      direction: Direction.up,
    });
    neighbors.push({
      bypass: new Position(col, row + 1),
      target: new Position(col, row + 2),
      direction: Direction.down,
    });
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
    neighbors.push({
      bypass: new Position(col - 1, row - 1),
      target: new Position(col - 2, row - 2),
      direction: Direction.upLeft,
    });
    neighbors.push({
      bypass: new Position(col + 1, row - 1),
      target: new Position(col + 2, row - 2),
      direction: Direction.upRight,
    });
    neighbors.push({
      bypass: new Position(col - 1, row + 1),
      target: new Position(col - 2, row + 2),
      direction: Direction.downLeft,
    });
    neighbors.push({
      bypass: new Position(col + 1, row + 1),
      target: new Position(col + 2, row + 2),
      direction: Direction.downRight,
    });
    return neighbors.filter(this.filterNeighbor.bind(this));

    // return neighbors.filter((value) => {
    //   const targetHole = this.getHole(value.target);
    //   if (!targetHole) {
    //     return false;
    //   }
    //   if (this.isRevert) {
    //     return targetHole.type !== HoleType.half;
    //   } else {
    //     return targetHole.type >= HoleType.empty;
    //   }
    // });
  }

  getDirection(dx: number, dy: number): Direction {
    let direction;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const radio = absDx / absDy;
    if (radio > 2 || radio < 0.5) {
      direction =
        absDx > absDy
          ? dx > 0
            ? Direction.right
            : Direction.left
          : dy > 0
          ? Direction.down
          : Direction.up;
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
      this.holes.unshift(
        Array(firstRowLength).fill({
          type: HoleType.temp,
          status: HoleStatus.normal,
        })
      );
      edge.top++;
    }
    while (edge.bottom - edge.innerHeight >= 0) {
      const lastRowLength = this.holes[this.holes.length - 1].length;
      this.holes.push(
        Array(lastRowLength).fill({
          type: HoleType.temp,
          status: HoleStatus.normal,
        })
      );
      edge.bottom--;
    }
    while (edge.left < 0) {
      this.holes.forEach((row) => {
        row.unshift({
          type: HoleType.temp,
          status: HoleStatus.normal,
        });
      });
      edge.left++;
    }
    while (edge.right - edge.innerWidth >= -1) {
      this.holes.forEach((row) => {
        row.push({
          type: HoleType.temp,
          status: HoleStatus.normal,
        });
      });
      edge.right--;
    }
  }
}
