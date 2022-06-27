import {
  BoardType,
  Direction,
  HoleType,
  Neighbor,
  Position,
} from 'src/app/type';

export class Map {
  map: HoleType[][];
  boardType: BoardType;
  startPosition: Position;
  width!: number;
  height!: number;
  constructor(
    map: HoleType[][],
    boardType: BoardType,
    startPosition: Position,
    width: number,
    height: number
  ) {
    this.map = map;
    this.boardType = boardType;
    this.startPosition = startPosition;
    this.height = height;
    this.width = width;
  }

  toString() {}

  getHoleType(position: Position): HoleType {
    return this.map[position.row][position.col];
  }

  isOutrange(position: Position): boolean {
    const rowMax = this.map.length - 1;
    if (position.row < 0 || position.row > rowMax) {
      return true;
    }
    const columnMax = this.map[position.row].length - 1;
    if (position.col < 0 || position.col > columnMax) {
      return true;
    }
    return false;
  }

  getNeighborPosition(
    position: Position,
    direction: Direction,
    neighbors?: Neighbor[]
  ): Neighbor | undefined {
    const values = neighbors ?? this.getNeighborPositions(position);
    return values.find((value) => value.direction === direction);
  }

  getNeighborPositions(position: Position, incluedEmpty = false): Neighbor[] {
    const neighbors: Neighbor[] = [];
    const { col, row } = position;
    if (this.boardType === BoardType.rectangular) {
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
    } else if (this.boardType === BoardType.octagon) {
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
    } else if (this.boardType === BoardType.hexagon) {
      const hasHalf = this.map[position.row][0] === HoleType.h;
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
    }
    if (incluedEmpty) {
      return neighbors;
    }
    return neighbors.filter(
      (value) =>
        !this.isOutrange(value.bypass) && !this.isOutrange(value.target)
    );
  }

  getDirection(dx: number, dy: number): Direction | undefined {
    let direction;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (
      this.boardType === BoardType.rectangular &&
      Math.max(absDx, absDy) > 10
    ) {
      direction =
        absDx > absDy
          ? dx > 0
            ? Direction.right
            : Direction.left
          : dy > 0
          ? Direction.down
          : Direction.up;
    } else if (
      this.boardType === BoardType.octagon &&
      Math.max(absDx, absDy) > 10
    ) {
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
    } else if (
      this.boardType === BoardType.hexagon &&
      Math.max(absDx, absDy) > 10
    ) {
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
    }
    return direction;
  }
}
