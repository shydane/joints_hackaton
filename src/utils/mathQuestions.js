import { seededRandom } from './dailySeed.js'

export function generateMathQuestions(seed, count = 100) {
  const random = seededRandom(seed)
  const questions = []

  for (let index = 0; index < count; index += 1) {
    let question

    if (index < 5) {
      const first = Math.floor(random() * 10) + 1
      const second = Math.floor(random() * 10) + 1
      const addition = random() > 0.3
      question = {
        level: 1,
        text: addition ? `${first} + ${second}` : `${first + second} - ${first}`,
        answer: addition ? first + second : second,
      }
    } else if (index < 15) {
      const first = Math.floor(random() * 40) + 10
      const second = Math.floor(random() * 30) + 5
      const addition = random() > 0.5
      question = {
        level: 2,
        text: addition ? `${first} + ${second}` : `${first + second} - ${first}`,
        answer: addition ? first + second : second,
      }
    } else {
      const first = Math.floor(random() * 8) + 2
      const second = Math.floor(random() * 8) + 2
      const multiplication = random() > 0.5
      question = {
        level: 3,
        text: multiplication ? `${first} × ${second}` : `${first * second} ÷ ${first}`,
        answer: multiplication ? first * second : second,
      }
    }

    const options = new Set([question.answer])
    while (options.size < 4) {
      const offset = (Math.floor(random() * 7) + 1) * (random() > 0.5 ? 1 : -1)
      const distractor = Math.max(0, question.answer + offset)
      if (distractor !== question.answer) options.add(distractor)
    }

    question.options = [...options]
    for (let optionIndex = question.options.length - 1; optionIndex > 0; optionIndex -= 1) {
      const swapIndex = Math.floor(random() * (optionIndex + 1))
      const current = question.options[optionIndex]
      question.options[optionIndex] = question.options[swapIndex]
      question.options[swapIndex] = current
    }
    questions.push(question)
  }

  return questions
}
