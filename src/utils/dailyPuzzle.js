import { seededRandom } from './dailySeed.js'

const SOLVED_BOARD = [0, 1, 2, 3, 4, 5, 6, 7, 8]

export function createDailyPuzzle(seed) {
  const random = seededRandom(seed)
  const board = [...SOLVED_BOARD]
  let blankIndex = 8
  let previousBlank = -1

  for (let step = 0; step < 70; step += 1) {
    const row = Math.floor(blankIndex / 3)
    const column = blankIndex % 3
    const neighbors = []

    if (row > 0) neighbors.push(blankIndex - 3)
    if (row < 2) neighbors.push(blankIndex + 3)
    if (column > 0) neighbors.push(blankIndex - 1)
    if (column < 2) neighbors.push(blankIndex + 1)

    const options = neighbors.filter(index => index !== previousBlank)
    const nextIndex = options[Math.floor(random() * options.length)]
    const movedTile = board[nextIndex]
    board[nextIndex] = 8
    board[blankIndex] = movedTile
    previousBlank = blankIndex
    blankIndex = nextIndex
  }

  if (board.every((tile, index) => tile === index)) {
    const neighbor = blankIndex % 3 > 0 ? blankIndex - 1 : blankIndex + 1
    board[blankIndex] = board[neighbor]
    board[neighbor] = 8
  }

  return board
}
