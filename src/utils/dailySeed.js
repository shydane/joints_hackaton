export function getTodayString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodaySeed(dateString = getTodayString()) {
  let hash = 0

  for (let index = 0; index < dateString.length; index += 1) {
    hash = (hash << 5) - hash + dateString.charCodeAt(index)
    hash |= 0
  }

  return hash >>> 0
}

export function seededRandom(seed) {
  let state = Number.isFinite(seed) ? Math.floor(seed) >>> 0 : 123456789

  return function nextRandom() {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function seededShuffle(array, seed) {
  const random = seededRandom(seed)
  const shuffled = [...array]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const currentValue = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = currentValue
  }

  return shuffled
}
