import { BoardStatusBase } from './status/board-status.base';
import { HexagonStatus } from './status/hexagon-status';
import { OctagonStatus } from './status/octagon-status';
import { RectStatus } from './status/rect-status';
import { BoardType, Hole, HoleStatus, HoleType, Position } from './type';

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

export class OutputBoard {
  map: HoleType[][];
  boardType: BoardType;
  singluarityPosition?: Position;
  isPlural: boolean;
  width!: number;
  height!: number;
  constructor(
    map: HoleType[][],
    boardType: BoardType,
    startPosition?: Position,
    isPlural = false
  ) {
    this.map = [...map];
    this.boardType = boardType;
    this.singluarityPosition = startPosition;
    this.height = map.length;
    this.width =
      boardType === BoardType.hexagon
        ? map[0].length
        : Math.max(map?.[0].length, map?.[1].length);
    this.isPlural = isPlural;
  }

  serilize(): string {
    const result = [
      this.boardType,
      this.width,
      this.height,
      this.singluarityPosition!.col,
      this.singluarityPosition!.row,
    ];
    return (
      result.join(' ') +
      ' ' +
      this.map
        .map((row) => row.map((type) => HoleTypeStringMap.get(type)).join(''))
        .join('')
    );
  }

  static deserialize(str: string): OutputBoard {
    const config = str.split(' ');
    const boardType = Number(config[0]) as BoardType;
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
    return new OutputBoard(map, boardType, startPosition);
  }

  toBoardStatus(isRevert: boolean): BoardStatusBase {
    const holesStatus: Hole[][] = this.map.map((row: HoleType[]) => {
      return row.map((value: HoleType) => {
        return {
          type: isRevert && value === HoleType.none ? HoleType.temp : value,
          status: HoleStatus.normal,
        };
      });
    });

    switch (this.boardType) {
      case BoardType.hexagon:
        return new HexagonStatus(
          holesStatus,
          isRevert,
          this.singluarityPosition
        );
      case BoardType.octagon:
        return new OctagonStatus(
          holesStatus,
          isRevert,
          this.singluarityPosition
        );
      case BoardType.rectangular:
      default:
        return new RectStatus(holesStatus, isRevert, this.singluarityPosition);
    }
  }
}
