import { getTodaySeed, seededRandom } from './dailySeed.js'

function clonePegs(pegs) {
  return pegs.map(peg => [...peg])
}

function pegsEqual(left, right) {
  return left.length === right.length && left.every((peg, index) => peg.length === right[index].length && peg.every((disk, diskIndex) => disk === right[index][diskIndex]))
}

export function isLegalHanoiMove(pegs, fromIndex, toIndex) {
  if (fromIndex === toIndex || !pegs[fromIndex]?.length || !pegs[toIndex]) return false
  const movingDisk = pegs[fromIndex][pegs[fromIndex].length - 1]
  const targetDisk = pegs[toIndex][pegs[toIndex].length - 1] ?? Infinity
  return movingDisk < targetDisk
}

export function createHanoiPegs(diskCount) {
  return [
    Array.from({ length: diskCount }, (_, index) => diskCount - index),
    [],
    [],
  ]
}

export function createShuffledHanoiPegs(diskCount, seed = getTodaySeed()) {
  const random = seededRandom(seed)
  const targetPegs = createHanoiPegs(0).map(() => [])
  targetPegs[2] = Array.from({ length: diskCount }, (_, index) => diskCount - index)

  let pegs = createHanoiPegs(diskCount)
  let lastMove = null

  // Buat konfigurasi awal yang legal tapi tidak langsung "siap pindah":
  // geser cakram secara acak selama beberapa langkah dari tumpukan standar.
  const steps = Math.max(12, diskCount * 8)
  for (let step = 0; step < steps; step += 1) {
    const moves = []
    for (let fromIndex = 0; fromIndex < 3; fromIndex += 1) {
      for (let toIndex = 0; toIndex < 3; toIndex += 1) {
        if (lastMove && fromIndex === lastMove[1] && toIndex === lastMove[0]) continue
        if (isLegalHanoiMove(pegs, fromIndex, toIndex)) moves.push([fromIndex, toIndex])
      }
    }

    if (!moves.length) break
    const nextMove = moves[Math.floor(random() * moves.length)]
    const [fromIndex, toIndex] = nextMove
    const movingDisk = pegs[fromIndex][pegs[fromIndex].length - 1]
    pegs[fromIndex].pop()
    pegs[toIndex].push(movingDisk)
    lastMove = nextMove
  }

  // Jangan mulai dari kondisi target/selesai.
  if (pegsEqual(pegs, targetPegs)) {
    const legalFirstMove = [0, 1].find(toIndex => isLegalHanoiMove(pegs, 2, toIndex))
    if (legalFirstMove !== undefined) {
      const movingDisk = pegs[2].pop()
      pegs[legalFirstMove].push(movingDisk)
    }
  }

  return clonePegs(pegs)
}

function solveHanoiDistance(startPegs, diskCount) {
  const targetPegs = [[], [], Array.from({ length: diskCount }, (_, index) => diskCount - index)]
  if (pegsEqual(startPegs, targetPegs)) return 0

  const queue = [{ pegs: clonePegs(startPegs), distance: 0 }]
  const visited = new Set([JSON.stringify(startPegs)])

  while (queue.length) {
    const current = queue.shift()
    for (let fromIndex = 0; fromIndex < 3; fromIndex += 1) {
      for (let toIndex = 0; toIndex < 3; toIndex += 1) {
        if (!isLegalHanoiMove(current.pegs, fromIndex, toIndex)) continue
        const nextPegs = clonePegs(current.pegs)
        nextPegs[toIndex].push(nextPegs[fromIndex].pop())
        const key = JSON.stringify(nextPegs)
        if (visited.has(key)) continue
        if (pegsEqual(nextPegs, targetPegs)) return current.distance + 1
        visited.add(key)
        queue.push({ pegs: nextPegs, distance: current.distance + 1 })
      }
    }
  }

  return (2 ** diskCount) - 1
}

export function getDailyHanoiConfig(dateString) {
  const random = seededRandom(getTodaySeed(dateString) + 77)
  const diskCount = 4 + Math.floor(random() * 3)

  const initialPegs = createShuffledHanoiPegs(diskCount, getTodaySeed(dateString) + 123)
  const optimalMoves = Math.max(1, solveHanoiDistance(initialPegs, diskCount))

  return {
    diskCount,
    initialPegs,
    optimalMoves,
  }
}