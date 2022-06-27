import { BoardType, Direction, HoleType, Neighbor, Position } from './type';

export const StringHoleTypeMap = new Map<string, HoleType>([
  ['H', HoleType.half],
  ['_', HoleType.none],
  ['O', HoleType.empty],
  ['1', HoleType.one],
  ['2', HoleType.two],
  ['3', HoleType.three],
  ['4', HoleType.four],
  ['5', HoleType.five],
  ['6', HoleType.six],
  ['7', HoleType.seven],
  ['8', HoleType.eight],
  ['9', HoleType.nine],
]);

export const HoleTypeStringMap = new Map<HoleType, string>([
  [HoleType.half, 'H'],
  [HoleType.none, '_'],
  [HoleType.empty, 'O'],
  [HoleType.one, '1'],
  [HoleType.two, '2'],
  [HoleType.three, '3'],
  [HoleType.four, '4'],
  [HoleType.five, '5'],
  [HoleType.six, '6'],
  [HoleType.seven, '7'],
  [HoleType.eight, '8'],
  [HoleType.nine, '9'],
]);

/**
 * Board type and size for sharing
 */

export class Board {
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

  serilize(): string {
    const result = [
      this.boardType,
      this.width,
      this.height,
      this.startPosition.col,
      this.startPosition.row,
    ];
    return (
      result.join(' ') +
      ' ' +
      this.map
        .map((row) => row.map((type) => HoleTypeStringMap.get(type)).join(''))
        .join('')
    );
  }

  static deserialize(str: string): Board {
    const config = str.split(' ');
    const boardType = new Number(config[0]) as BoardType;
    const width = Number(config[1]);
    const height = Number(config[2]);
    const startPosition = new Position(Number(config[3]), Number(config[4]));
    const map = [];
    const mapArray = config[5]
      .split('')
      .map((char) => StringHoleTypeMap.get(char)!);
    if (boardType === BoardType.hexagon) {
      let index = 0;
      let row = 0;
      while (index < mapArray.length) {
        const firstCell = mapArray[index];
        if (firstCell === HoleType.half) {
          map[row] = mapArray.slice(index, index + width);
          index += width;
          row++;
        } else {
          map[row] = mapArray.slice(index, index + width - 1);
          index += width - 1;
          row++;
        }
      }
    } else {
      for (let i = 0; i < height; i++) {
        map[i] = mapArray.slice(i * width, (i + 1) * width);
      }
    }
    return new Board(map, boardType, startPosition, width, height);
  }

  getNeighborPosition(
    position: Position,
    direction: Direction,
    neighbors?: Neighbor[]
  ): Neighbor | undefined {
    const values = neighbors ?? this.getNeighborPositions(position);
    return values.find((value) => value.direction === direction);
  }

  getNeighborPositions(position: Position): Neighbor[] {
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
      const hasHalf = this.map[position.row][0] === HoleType.half;
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
    return neighbors;
    // return neighbors.filter(
    //   (value) =>
    //     !this.isOutrange(value.bypass) && !this.isOutrange(value.target)
    // );
  }
}
