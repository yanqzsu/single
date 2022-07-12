import { Injectable } from '@angular/core';

export type GridType =
  | 'none'
  | 'center'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface Position {
  x: number;
  y: number;
}

export type MoveDirection = 'up' | 'down' | 'left' | 'right';

export interface Operation {
  direction: MoveDirection;
  targetPosition: Position;
  sourcePosition: Position;
}

export interface Status {
  remainingCount: number;
  mobileCellCount: number;
  currentCombo: number;
  maxCombo: number;
  comboCount: number;
  takenCount: number;
  score: number;
  steps: number;
}

export enum PieceStatus {
  'none' = -1,
  'empty' = 0,
  'hasCell' = 1,
  'mobile' = 2,
}

@Injectable({
  providedIn: 'root',
})
export class BackupService {
  private readonly STEP_BONUS = 10;
  private readonly COMBO_BONUS = 2;
  private readonly MAX_COMBO_BONUS = 10;

  gridArray: GridType[][] = [
    ['none', 'none', 'top-left', 'top', 'top-right', 'none', 'none'],
    ['none', 'none', 'left', 'center', 'right', 'none', 'none'],
    ['top-left', 'top', 'center', 'center', 'center', 'top', 'top-right'],
    ['left', 'center', 'center', 'center', 'center', 'center', 'right'],
    [
      'bottom-left',
      'bottom',
      'center',
      'center',
      'center',
      'bottom',
      'bottom-right',
    ],
    ['none', 'none', 'left', 'center', 'right', 'none', 'none'],
    ['none', 'none', 'bottom-left', 'bottom', 'bottom-right', 'none', 'none'],
  ];
  pieceArray = [
    [
      PieceStatus.none,
      PieceStatus.none,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.none,
      PieceStatus.none,
    ],
    [
      PieceStatus.none,
      PieceStatus.none,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.none,
      PieceStatus.none,
    ],
    [
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
    ],
    [
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.empty,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
    ],
    [
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
    ],
    [
      PieceStatus.none,
      PieceStatus.none,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.none,
      PieceStatus.none,
    ],
    [
      PieceStatus.none,
      PieceStatus.none,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.hasCell,
      PieceStatus.none,
      PieceStatus.none,
    ],
  ];

  selectedPosition: Position = {
    x: -1,
    y: -1,
  };

  scoreStatus: Status = {
    remainingCount: 0,
    mobileCellCount: 0,
    currentCombo: 0,
    maxCombo: 0,
    comboCount: 0,
    takenCount: 0,
    score: 0,
    steps: 0,
  };

  operationStack: Operation[] = [];

  constructor() {}

  move(direction: MoveDirection) {
    let targetPosition: Position;
    let bypassPosition: Position;
    switch (direction) {
      case 'right':
        targetPosition = {
          x: this.selectedPosition.x + 2,
          y: this.selectedPosition.y,
        };
        bypassPosition = {
          x: this.selectedPosition.x + 1,
          y: this.selectedPosition.y,
        };
        break;
      case 'left':
        targetPosition = {
          x: this.selectedPosition.x - 2,
          y: this.selectedPosition.y,
        };
        bypassPosition = {
          x: this.selectedPosition.x - 1,
          y: this.selectedPosition.y,
        };
        break;
      case 'down':
        targetPosition = {
          x: this.selectedPosition.x,
          y: this.selectedPosition.y + 2,
        };
        bypassPosition = {
          x: this.selectedPosition.x,
          y: this.selectedPosition.y + 1,
        };
        break;
      case 'up':
        targetPosition = {
          x: this.selectedPosition.x,
          y: this.selectedPosition.y - 2,
        };
        bypassPosition = {
          x: this.selectedPosition.x,
          y: this.selectedPosition.y - 1,
        };
        break;
      default:
        return;
    }
    if (this.isOutrange(targetPosition) || this.isOutrange(bypassPosition)) {
      return;
    }
    const bypassPiece = this.pieceArray[bypassPosition?.y][bypassPosition?.x];
    const targetPiece = this.pieceArray[targetPosition?.y][targetPosition?.x];
    if (bypassPiece > 0 && targetPiece === 0) {
      this.pieceArray[bypassPosition?.y][bypassPosition?.x] = PieceStatus.empty;
      this.pieceArray[targetPosition?.y][targetPosition?.x] =
        PieceStatus.hasCell;
      this.pieceArray[this.selectedPosition.y][this.selectedPosition.x] =
        PieceStatus.empty;
      this.operationStack.push({
        direction,
        targetPosition: targetPosition,
        sourcePosition: { ...this.selectedPosition },
      });
      this.updateStatus();
      this.pieceArray = this.pieceArray.map((arr) => arr.slice());
      this.selectedPosition = {
        x: targetPosition.x,
        y: targetPosition.y,
      };
    }
  }

  undo(): void {
    if (this.operationStack.length <= 0) {
      return;
    }
    const lastOperation = this.operationStack.pop()!;
    let targetPosition: Position;
    let bypassPosition: Position;
    switch (lastOperation.direction) {
      case 'left':
        targetPosition = {
          x: lastOperation.targetPosition.x + 2,
          y: lastOperation.targetPosition.y,
        };
        bypassPosition = {
          x: lastOperation.targetPosition.x + 1,
          y: lastOperation.targetPosition.y,
        };
        break;
      case 'right':
        targetPosition = {
          x: lastOperation.targetPosition.x - 2,
          y: lastOperation.targetPosition.y,
        };
        bypassPosition = {
          x: lastOperation.targetPosition.x - 1,
          y: lastOperation.targetPosition.y,
        };
        break;
      case 'up':
        targetPosition = {
          x: lastOperation.targetPosition.x,
          y: lastOperation.targetPosition.y + 2,
        };
        bypassPosition = {
          x: lastOperation.targetPosition.x,
          y: lastOperation.targetPosition.y + 1,
        };
        break;
      case 'down':
        targetPosition = {
          x: lastOperation.targetPosition.x,
          y: lastOperation.targetPosition.y - 2,
        };
        bypassPosition = {
          x: lastOperation.targetPosition.x,
          y: lastOperation.targetPosition.y - 1,
        };
        break;
      default:
        return;
    }
    if (this.isOutrange(targetPosition) || this.isOutrange(bypassPosition)) {
      return;
    }
    this.pieceArray[bypassPosition?.y][bypassPosition?.x] = PieceStatus.hasCell;
    this.pieceArray[targetPosition?.y][targetPosition?.x] = PieceStatus.hasCell;
    this.pieceArray[lastOperation.targetPosition.y][
      lastOperation.targetPosition.x
    ] = PieceStatus.empty;
    this.updateStatus();
    this.pieceArray = this.pieceArray.map((arr) => arr.slice());
    this.selectedPosition = {
      x: targetPosition.x,
      y: targetPosition.y,
    };
  }

  updateStatus(): void {
    const status: Status = {
      remainingCount: 0,
      mobileCellCount: 0,
      currentCombo: 0,
      maxCombo: 0,
      comboCount: 0,
      takenCount: 0,
      score: 0,
      steps: 0,
    };
    this.updateRemaining(status);
    for (let index = 0; index < this.operationStack.length; index++) {
      const operation = this.operationStack[index];
      if (index > 0) {
        const previousOperation = this.operationStack[index - 1];
        if (
          this.isSamePosition(
            previousOperation.targetPosition,
            operation.sourcePosition
          )
        ) {
          status.currentCombo += 1;
          status.comboCount += 1;
          if (status.currentCombo > status.maxCombo) {
            status.maxCombo = status.currentCombo;
          }
        } else {
          status.steps += 1;
          status.currentCombo = 0;
        }
        status.takenCount += 1;
      } else {
        status.takenCount = 1;
        status.steps = 1;
      }
    }
    status.score =
      Math.pow(status.comboCount, this.COMBO_BONUS) +
      status.takenCount * this.STEP_BONUS +
      status.maxCombo * this.MAX_COMBO_BONUS;
    this.scoreStatus = { ...status };
    console.log(status);
    // if (status.mobileCellCount === 0) {
    //   this.showGameOver();
    // } else {
    //   this.clearOverlay();
    // }
  }

  updateRemaining(status: Status): void {
    let remainingCount = 0;
    let mobileCellCount = 0;
    for (let y = 0; y < this.pieceArray.length; y++) {
      const row = this.pieceArray[y];
      for (let x = 0; x < row.length; x++) {
        const cell = row[x];
        if (cell > 0) {
          remainingCount += 1;
          const neighbor = [
            [y - 1, x, y - 2, x],
            [y + 1, x, y + 2, x],
            [y, x + 1, y, x + 2],
            [y, x - 1, y, x - 2],
          ];
          let mobile = false;
          for (let index = 0; index < neighbor.length; index++) {
            const bypassPosition = {
              y: neighbor[index][0],
              x: neighbor[index][1],
            };
            const targetPosition = {
              y: neighbor[index][2],
              x: neighbor[index][3],
            };

            if (
              !this.isOutrange(bypassPosition) &&
              !this.isOutrange(targetPosition) &&
              this.pieceArray[bypassPosition.y][bypassPosition.x] >
                PieceStatus.empty &&
              this.pieceArray[targetPosition.y][targetPosition.x] ===
                PieceStatus.empty
            ) {
              mobile = true;
              break;
            }
          }
          if (mobile) {
            mobileCellCount += 1;
            this.pieceArray[y][x] = PieceStatus.mobile;
          } else {
            this.pieceArray[y][x] = PieceStatus.hasCell;
          }
        }
      }
    }
    status.remainingCount = remainingCount;
    status.mobileCellCount = mobileCellCount;
  }

  isOutrange(position: Position, xMax?: number, yMax?: number): boolean {
    if (!xMax) {
      xMax = this.gridArray[0].length - 1;
    }
    if (!yMax) {
      yMax = this.gridArray.length - 1;
    }
    return (
      position.x < 0 || position.x > xMax || position.y < 0 || position.y > yMax
    );
  }

  isSamePosition(a: Position, b: Position) {
    return a.x === b.x && a.y === b.y;
  }
}
