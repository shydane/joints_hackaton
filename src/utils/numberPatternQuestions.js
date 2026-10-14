import { seededRandom, seededShuffle } from './dailySeed.js'

export function generateNumberPatternQuestions(seed) {
  const random = seededRandom(seed)
  const randomInteger = (minimum, maximum) =>
    Math.floor(random() * (maximum - minimum + 1)) + minimum

  const buildQuestion = ({ id, type, level, sequence, blankIndex, explanation }) => {
    const answer = sequence[blankIndex]
    const options = new Set([answer])
    const offsets = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5]

    for (const offset of offsets) {
      if (options.size === 4) break
      const option = answer + offset
      if (option >= 0) options.add(option)
    }

    for (let offset = 10; options.size < 4; offset += 1) {
      options.add(answer + offset)
    }

    return {
      id,
      type,
      level,
      sequence: sequence.map((value, index) => index === blankIndex ? null : value),
      answer,
      explanation,
      options: seededShuffle([...options], seed + id * 3571),
    }
  }

  const questions = []

  const increasingStart = randomInteger(2, 10)
  const increasingStep = randomInteger(2, 6)
  const increasingSequence = Array.from({ length: 6 }, (_, index) => increasingStart + index * increasingStep)
  const increasingBlank = randomInteger(3, 5)
  questions.push(buildQuestion({
    id: 1,
    type: 'Aritmatika naik',
    level: 'Mudah',
    sequence: increasingSequence,
    blankIndex: increasingBlank,
    explanation: `Setiap suku bertambah ${increasingStep}: pola penjumlahan konstan (+${increasingStep}).`,
  }))

  const decreasingStart = randomInteger(40, 70)
  const decreasingStep = randomInteger(3, 7)
  const decreasingSequence = Array.from({ length: 6 }, (_, index) => decreasingStart - index * decreasingStep)
  const decreasingBlank = randomInteger(3, 5)
  questions.push(buildQuestion({
    id: 2,
    type: 'Aritmatika turun',
    level: 'Mudah',
    sequence: decreasingSequence,
    blankIndex: decreasingBlank,
    explanation: `Setiap suku berkurang ${decreasingStep}: pola pengurangan konstan (-${decreasingStep}).`,
  }))

  const multiplier = randomInteger(2, 3)
  const geometricStart = multiplier === 2 ? randomInteger(2, 5) : randomInteger(1, 3)
  const geometricSequence = Array.from({ length: 5 }, (_, index) => geometricStart * multiplier ** index)
  const geometricBlank = randomInteger(2, 4)
  questions.push(buildQuestion({
    id: 3,
    type: 'Geometri',
    level: 'Sedang',
    sequence: geometricSequence,
    blankIndex: geometricBlank,
    explanation: `Setiap suku dikalikan ${multiplier} dari suku sebelumnya.`,
  }))

  const squareStart = randomInteger(1, 4)
  const squareOffset = randomInteger(0, 3)
  const squareSequence = Array.from({ length: 6 }, (_, index) => (squareStart + index) ** 2 + squareOffset)
  const squareBlank = randomInteger(2, 5)
  questions.push(buildQuestion({
    id: 4,
    type: 'Bilangan kuadrat',
    level: 'Sedang',
    sequence: squareSequence,
    blankIndex: squareBlank,
    explanation: squareOffset === 0
      ? `Pola bilangan kuadrat: setiap suku adalah kuadrat berurutan mulai dari ${squareStart}².`
      : `Pola bilangan kuadrat berurutan ditambah konstanta ${squareOffset}.`,
  }))

  let steppedValue = randomInteger(3, 10)
  const differenceStep = randomInteger(1, 3)
  let currentDifference = randomInteger(2, 4)
  const steppedSequence = [steppedValue]
  for (let index = 0; index < 5; index += 1) {
    steppedValue += currentDifference
    steppedSequence.push(steppedValue)
    currentDifference += differenceStep
  }
  const steppedBlank = randomInteger(3, 5)
  questions.push(buildQuestion({
    id: 5,
    type: 'Aritmatika bertingkat',
    level: 'Menengah',
    sequence: steppedSequence,
    blankIndex: steppedBlank,
    explanation: `Selisih antar suku bertambah ${differenceStep} pada setiap langkah.`,
  }))

  const fibonacciFirst = randomInteger(1, 4)
  const fibonacciSecond = randomInteger(2, 5)
  const fibonacciSequence = [fibonacciFirst, fibonacciSecond]
  for (let index = 2; index < 6; index += 1) {
    fibonacciSequence.push(fibonacciSequence[index - 1] + fibonacciSequence[index - 2])
  }
  const fibonacciBlank = randomInteger(3, 5)
  questions.push(buildQuestion({
    id: 6,
    type: 'Fibonacci',
    level: 'Menengah',
    sequence: fibonacciSequence,
    blankIndex: fibonacciBlank,
    explanation: 'Setiap suku merupakan jumlah dua suku sebelumnya.',
  }))

  const alternatingAddition = randomInteger(2, 4)
  let alternatingValue = randomInteger(2, 5)
  const alternatingSequence = [alternatingValue]
  for (let index = 1; index < 6; index += 1) {
    alternatingValue = index % 2 === 1
      ? alternatingValue + alternatingAddition
      : alternatingValue * 2
    alternatingSequence.push(alternatingValue)
  }
  const alternatingBlank = randomInteger(3, 5)
  questions.push(buildQuestion({
    id: 7,
    type: 'Operasi selang-seling',
    level: 'Tantangan',
    sequence: alternatingSequence,
    blankIndex: alternatingBlank,
    explanation: `Operasi bergantian antara tambah ${alternatingAddition} dan kali 2.`,
  }))

  const evenStep = randomInteger(2, 4)
  const oddStep = randomInteger(3, 5)
  let evenValue = randomInteger(2, 8)
  let oddValue = randomInteger(15, 30)
  const interleavedSequence = []
  for (let index = 0; index < 6; index += 1) {
    if (index % 2 === 0) {
      interleavedSequence.push(evenValue)
      evenValue += evenStep
    } else {
      interleavedSequence.push(oddValue)
      oddValue += oddStep
    }
  }
  const interleavedBlank = randomInteger(3, 5)
  questions.push(buildQuestion({
    id: 8,
    type: 'Deret berseling',
    level: 'Tantangan',
    sequence: interleavedSequence,
    blankIndex: interleavedBlank,
    explanation: `Ada dua deret berselang-seling: satu bertambah ${evenStep}, dan yang lain bertambah ${oddStep}.`,
  }))

  return questions
}
