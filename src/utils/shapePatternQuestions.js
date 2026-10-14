import { seededRandom, seededShuffle } from './dailySeed.js'

export const SHAPE_COLORS = [
  { name: 'emerald', fill: '#10B981', border: '#047857' },
  { name: 'amber', fill: '#F59E0B', border: '#B45309' },
  { name: 'sky', fill: '#0EA5E9', border: '#0369A1' },
  { name: 'rose', fill: '#F43F5E', border: '#BE123C' },
  { name: 'indigo', fill: '#6366F1', border: '#4338CA' },
  { name: 'violet', fill: '#8B5CF6', border: '#6D28D9' },
]

const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon']
const SIZES = ['small', 'medium', 'large']
const ROTATIONS = [0, 90, 180, 270]

function createShape(shapeIndex, colorIndex, sizeIndex, rotationIndex) {
  return {
    shape: SHAPES[shapeIndex],
    color: SHAPE_COLORS[colorIndex],
    size: SIZES[sizeIndex],
    rotation: ROTATIONS[rotationIndex],
  }
}

function sameShape(first, second) {
  return first.shape === second.shape
    && first.color.name === second.color.name
    && first.size === second.size
    && first.rotation === second.rotation
}

export function generateShapePatternQuestions(seed) {
  const random = seededRandom(seed)
  const randomIndex = length => Math.floor(random() * length)
  const questions = []

  for (let questionIndex = 0; questionIndex < 6; questionIndex += 1) {
    const level = questionIndex < 2 ? 'Mudah' : questionIndex < 3 ? 'Sedang' : 'Tantangan'
    const baseShape = randomIndex(SHAPES.length)
    const baseColor = randomIndex(SHAPE_COLORS.length)
    const baseSize = randomIndex(SIZES.length)
    const baseRotation = randomIndex(ROTATIONS.length)
    const ruleRoll = random()
    let rule
    let hint

    if (questionIndex < 2) {
      rule = ruleRoll > 0.5 ? 'shape' : 'color'
      hint = rule === 'shape'
        ? 'Perhatikan perubahan bentuk dari kiri ke kanan.'
        : 'Perhatikan perubahan warna dari kiri ke kanan.'
    } else if (questionIndex === 2) {
      rule = ruleRoll > 0.5 ? 'rotation' : 'size'
      hint = rule === 'rotation'
        ? 'Perhatikan putaran bentuk dari kiri ke kanan.'
        : 'Perhatikan perubahan ukuran bentuk dari kiri ke kanan.'
    } else {
      rule = ['shape-color', 'color-rotation', 'shape-size'][randomIndex(3)]
      hint = {
        'shape-color': 'Ada dua aturan: bentuk berubah tiap kolom dan warna berubah tiap baris.',
        'color-rotation': 'Warna berubah mengikuti baris dan kolom, sementara rotasi mengikuti kolom.',
        'shape-size': 'Amati perubahan bentuk tiap kolom serta ukuran tiap baris.',
      }[rule]
    }

    const grid = Array.from({ length: 3 }, (_, rowIndex) =>
      Array.from({ length: 3 }, (_, columnIndex) => {
        let shapeIndex = baseShape
        let colorIndex = baseColor
        let sizeIndex = baseSize
        let rotationIndex = baseRotation

        switch (rule) {
          case 'shape':
            shapeIndex = (baseShape + columnIndex) % SHAPES.length
            break
          case 'color':
            colorIndex = (baseColor + columnIndex) % SHAPE_COLORS.length
            break
          case 'rotation':
            rotationIndex = (baseRotation + columnIndex + rowIndex) % ROTATIONS.length
            break
          case 'size':
            sizeIndex = (baseSize + columnIndex) % SIZES.length
            break
          case 'shape-color':
            shapeIndex = (baseShape + columnIndex) % SHAPES.length
            colorIndex = (baseColor + rowIndex) % SHAPE_COLORS.length
            break
          case 'color-rotation':
            colorIndex = (baseColor + rowIndex + columnIndex) % SHAPE_COLORS.length
            rotationIndex = (baseRotation + columnIndex) % ROTATIONS.length
            break
          case 'shape-size':
            shapeIndex = (baseShape + columnIndex) % SHAPES.length
            sizeIndex = (baseSize + rowIndex) % SIZES.length
            break
          default:
            break
        }

        return createShape(shapeIndex, colorIndex, sizeIndex, rotationIndex)
      }),
    )

    const correctAnswer = grid[2][2]
    const options = [correctAnswer]
    const distractors = []

    for (let shapeIndex = 0; shapeIndex < SHAPES.length; shapeIndex += 1) {
      for (let colorIndex = 0; colorIndex < SHAPE_COLORS.length; colorIndex += 1) {
        for (let sizeIndex = 0; sizeIndex < SIZES.length; sizeIndex += 1) {
          for (let rotationIndex = 0; rotationIndex < ROTATIONS.length; rotationIndex += 1) {
            const candidate = createShape(shapeIndex, colorIndex, sizeIndex, rotationIndex)
            if (!sameShape(candidate, correctAnswer)) distractors.push(candidate)
          }
        }
      }
    }

    options.push(...seededShuffle(distractors, seed + questionIndex * 7919).slice(0, 4))
    questions.push({
      id: questionIndex + 1,
      difficulty: level,
      hint,
      grid,
      correctAnswer,
      options: seededShuffle(options, seed + questionIndex * 104729 + 17),
    })
  }

  return questions
}
