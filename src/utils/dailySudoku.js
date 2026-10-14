import { getTodaySeed, seededShuffle } from './dailySeed.js'

const SIZE = 4
const BOX_SIZE = 2

export function isValidSudokuPlacement(grid, row, column, value) {
  for (let index = 0; index < SIZE; index += 1) {
    if (index !== column && grid[row][index] === value) return false
    if (index !== row && grid[index][column] === value) return false
  }

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE
  const boxColumn = Math.floor(column / BOX_SIZE) * BOX_SIZE
  for (let boxR = boxRow; boxR < boxRow + BOX_SIZE; boxR += 1) {
    for (let boxC = boxColumn; boxC < boxColumn + BOX_SIZE; boxC += 1) {
      if ((boxR !== row || boxC !== column) && grid[boxR][boxC] === value) return false
    }
  }

  return true
}

export function countSudokuSolutions(grid, limit = 2) {
  const emptyCell = grid.flatMap((row, rowIndex) =>
    row.map((value, columnIndex) => value === 0 ? [rowIndex, columnIndex] : null),
  ).find(Boolean)

  if (!emptyCell) return 1

  const [row, column] = emptyCell
  let solutionCount = 0
  for (let value = 1; value <= SIZE; value += 1) {
    if (!isValidSudokuPlacement(grid, row, column, value)) continue
    grid[row][column] = value
    solutionCount += countSudokuSolutions(grid, limit - solutionCount)
    grid[row][column] = 0
    if (solutionCount >= limit) return solutionCount
  }
  return solutionCount
}

export function getSudokuConflicts(grid) {
  const conflicts = new Set()
  const recordDuplicates = cells => {
    const seen = new Map()
    for (const [row, column] of cells) {
      const value = grid[row][column]
      if (value === 0) continue
      if (seen.has(value)) {
        const [firstRow, firstColumn] = seen.get(value)
        conflicts.add(`${row}-${column}`)
        conflicts.add(`${firstRow}-${firstColumn}`)
      } else {
        seen.set(value, [row, column])
      }
    }
  }

  for (let index = 0; index < SIZE; index += 1) {
    recordDuplicates(Array.from({ length: SIZE }, (_, offset) => [index, offset]))
    recordDuplicates(Array.from({ length: SIZE }, (_, offset) => [offset, index]))
  }

  for (let boxRow = 0; boxRow < SIZE; boxRow += BOX_SIZE) {
    for (let boxColumn = 0; boxColumn < SIZE; boxColumn += BOX_SIZE) {
      recordDuplicates(
        Array.from({ length: BOX_SIZE * BOX_SIZE }, (_, index) => [
          boxRow + Math.floor(index / BOX_SIZE),
          boxColumn + index % BOX_SIZE,
        ]),
      )
    }
  }

  return conflicts
}

function buildSolution(seed) {
  const template = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ]
  const bands = seededShuffle([0, 1], seed + 11)
  const rowOrder = bands.flatMap(band =>
    seededShuffle([0, 1], seed + 101 + band).map(offset => band * BOX_SIZE + offset),
  )
  const stacks = seededShuffle([0, 1], seed + 211)
  const columnOrder = stacks.flatMap(stack =>
    seededShuffle([0, 1], seed + 307 + stack).map(offset => stack * BOX_SIZE + offset),
  )
  const symbols = seededShuffle([1, 2, 3, 4], seed + 401)

  return rowOrder.map(row =>
    columnOrder.map(column => symbols[template[row][column] - 1]),
  )
}

export function generateDailySudoku(dateString) {
  const seed = getTodaySeed(dateString)
  const solution = buildSolution(seed)
  const puzzle = solution.map(row => [...row])
  const positions = seededShuffle(
    Array.from({ length: SIZE * SIZE }, (_, index) => [Math.floor(index / SIZE), index % SIZE]),
    seed + 503,
  )
  let cluesRemaining = SIZE * SIZE
  const targetClues = 7

  for (const [row, column] of positions) {
    if (cluesRemaining <= targetClues) break
    const originalValue = puzzle[row][column]
    puzzle[row][column] = 0

    if (countSudokuSolutions(puzzle.map(line => [...line])) === 1) {
      cluesRemaining -= 1
    } else {
      puzzle[row][column] = originalValue
    }
  }

  return { puzzle, solution }
}
