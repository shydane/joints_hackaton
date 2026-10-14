const REQUIRED_COLUMNS = ['student_id', 'periode', 'nilai', 'kehadiran']

function countDelimiters(line, delimiter) {
  let count = 0
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === '"') {
      if (inQuotes && line[index + 1] === '"') {
        index += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (line[index] === delimiter && !inQuotes) {
      count += 1
    }
  }

  return count
}

function parseRecords(text, delimiter) {
  const records = []
  let fields = []
  let field = ''
  let inQuotes = false
  let malformed = false
  let line = 1
  let recordLine = 1

  const finishField = () => {
    fields.push(field)
    field = ''
  }
  const finishRecord = () => {
    finishField()
    if (fields.some(value => value.trim() !== '')) {
      records.push({ fields, row: recordLine, malformed })
    }
    fields = []
    malformed = false
    recordLine = line + 1
  }

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]

    if (character === '"') {
      if (inQuotes && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (character === delimiter && !inQuotes) {
      finishField()
    } else if ((character === '\n' || character === '\r') && !inQuotes) {
      finishRecord()
      if (character === '\r' && text[index + 1] === '\n') index += 1
      line += 1
      recordLine = line
    } else {
      field += character
      if (character === '\n' || character === '\r') line += 1
    }
  }

  if (inQuotes) malformed = true
  if (field !== '' || fields.length > 0) {
    finishField()
    if (fields.some(value => value.trim() !== '')) {
      records.push({ fields, row: recordLine, malformed })
    }
  }

  return records
}

export function parseAcademicCsvPreview(csvText) {
  const text = String(csvText || '').replace(/^\uFEFF/, '')
  if (!text.trim()) return { headers: [], rows: [] }

  const firstLine = text.split(/\r?\n/).find(line => line.trim() !== '') || ''
  const delimiter = countDelimiters(firstLine, ';') > countDelimiters(firstLine, ',') ? ';' : ','
  const records = parseRecords(text, delimiter)
  const [headerRecord, ...dataRecords] = records

  return {
    headers: headerRecord?.fields || [],
    rows: dataRecords.map(record => record.fields),
  }
}

function parseNumber(value) {
  const normalized = value.trim().replace(',', '.')
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

export function parseAcademicCsv(csvText, users, classTeacherId) {
  const text = String(csvText || '').replace(/^\uFEFF/, '')
  if (!text.trim()) {
    return { validRows: [], errors: [{ row: 1, reason: 'File CSV kosong.' }] }
  }

  const firstLine = text.split(/\r?\n/).find(line => line.trim() !== '') || ''
  const delimiter = countDelimiters(firstLine, ';') > countDelimiters(firstLine, ',') ? ';' : ','
  const records = parseRecords(text, delimiter)
  if (records.length === 0) {
    return { validRows: [], errors: [{ row: 1, reason: 'File CSV kosong.' }] }
  }

  const header = records[0].fields.map(value => value.trim().toLowerCase())
  const missingColumns = REQUIRED_COLUMNS.filter(column => !header.includes(column))
  if (missingColumns.length > 0) {
    return {
      validRows: [],
      errors: [{
        row: records[0].row,
        reason: `Header tidak sesuai. Kolom wajib: ${REQUIRED_COLUMNS.join(', ')}.`,
      }],
    }
  }

  const columnIndex = Object.fromEntries(header.map((name, index) => [name, index]))
  const classTeacher = users.find(user => user.id === classTeacherId && user.role === 'wali_kelas')
  const validRows = []
  const errors = []

  records.slice(1).forEach(record => {
    const fail = reason => errors.push({ row: record.row, reason })
    if (record.malformed) {
      fail('Format tanda kutip CSV tidak valid.')
      return
    }
    if (record.fields.length !== header.length) {
      fail('Jumlah kolom pada baris tidak sesuai dengan header.')
      return
    }

    const studentId = record.fields[columnIndex.student_id].trim()
    const student = users.find(user => user.id === studentId)
    if (!student) {
      fail('ID siswa tidak ditemukan di sistem.')
      return
    }
    if (student.role !== 'siswa') {
      fail('ID tersebut bukan akun siswa.')
      return
    }
    if (!classTeacher || student.class !== classTeacher.class) {
      fail('bukan siswa kelas Anda')
      return
    }

    const periode = record.fields[columnIndex.periode].trim()
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periode)) {
      fail('Periode harus menggunakan format YYYY-MM.')
      return
    }

    const nilaiRataRata = parseNumber(record.fields[columnIndex.nilai])
    if (nilaiRataRata === null || nilaiRataRata < 0 || nilaiRataRata > 100) {
      fail('Nilai harus berupa angka dalam rentang 0–100.')
      return
    }

    const kehadiranPersen = parseNumber(record.fields[columnIndex.kehadiran])
    if (kehadiranPersen === null || kehadiranPersen < 0 || kehadiranPersen > 100) {
      fail('Kehadiran harus berupa angka dalam rentang 0–100.')
      return
    }

    validRows.push({
      studentId,
      periode,
      nilaiRataRata,
      kehadiranPersen,
      nama: columnIndex.nama === undefined ? student.name : record.fields[columnIndex.nama].trim() || student.name,
    })
  })

  return { validRows, errors }
}
