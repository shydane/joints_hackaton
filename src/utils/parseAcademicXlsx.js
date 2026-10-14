import readXlsxFile from 'read-excel-file/browser'

const REQUIRED_COLUMNS = ['student_id', 'periode', 'nilai', 'kehadiran']
const OPTIONAL_COLUMNS = ['nama']

function normalizeHeader(value) {
  return String(value ?? '').trim().toLowerCase()
}

function csvValue(value) {
  const text = String(value ?? '')
  return /[;"\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function csvPeriod(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}`
  }
  return String(value ?? '').trim()
}

export async function readAcademicXlsx(file, { sheetName } = {}) {
  const sheets = await readXlsxFile(file)
  const sheetNames = sheets.map(sheet => sheet.sheet)
  if (sheetNames.length === 0) throw new Error('Buku kerja Excel tidak memiliki lembar data.')

  const selectedSheetName = sheetName || (
    sheetNames.includes('Data') ? 'Data' : sheetNames[0]
  )
  const selectedSheet = sheets.find(sheet => sheet.sheet === selectedSheetName)
  if (!selectedSheet) throw new Error('Lembar yang dipilih tidak ditemukan dalam file Excel.')

  const sheetRows = selectedSheet.data
  const originalHeaders = (sheetRows[0] || []).map(value => String(value ?? '').trim())
  const headers = originalHeaders.map(normalizeHeader)
  const columnIndexes = Object.fromEntries(headers.map((header, index) => [header, index]))
  const missingColumns = REQUIRED_COLUMNS.filter(column => !headers.includes(column))
  const dataRows = sheetRows.slice(1).flatMap((cells, index) => {
    if (cells.every(value => value === null || value === undefined || String(value).trim() === '')) {
      return []
    }
    const rowNumber = index + 2
    const values = headers.map((header, columnIndex) => (
      header === 'periode' ? csvPeriod(cells[columnIndex]) : cells[columnIndex] ?? ''
    ))
    const row = Object.fromEntries(headers.map((header, columnIndex) => [header, values[columnIndex]]))
    row._rowNumber = rowNumber
    const missingCachedValue = REQUIRED_COLUMNS.some(column => (
      headers.includes(column) && (row[column] === '' || row[column] === null)
    ))
    if (missingCachedValue) {
      row._error = 'Kolom wajib kosong atau rumus tidak memiliki nilai hasil tersimpan.'
    }
    return [{ row, values }]
  })

  const attendanceIndex = columnIndexes.kehadiran
  const attendanceValues = dataRows
    .map(({ row }) => row.kehadiran)
    .filter(value => value !== '' && value !== null && value !== undefined)
    .map(value => typeof value === 'number' ? value : Number(String(value).trim()))
  const attendanceAsFractions = attendanceValues.length > 0
    && attendanceValues.every(value => Number.isFinite(value) && value >= 0 && value <= 1)

  if (attendanceAsFractions && attendanceIndex !== undefined) {
    dataRows.forEach(({ row, values }) => {
      const value = row.kehadiran
      if (value === '' || value === null || value === undefined) return
      const normalized = typeof value === 'number' ? value : Number(String(value).trim())
      row.kehadiran = normalized * 100
      values[attendanceIndex] = normalized * 100
    })
  }

  const csvHeaders = headers.length ? headers : [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]
  const normalizedCsv = [
    csvHeaders.map(csvValue).join(';'),
    ...dataRows.map(({ values }) => values.map(csvValue).join(';')),
  ].join('\r\n')

  return {
    sheetNames,
    sheetName: selectedSheetName,
    headers,
    rows: dataRows.map(({ row }) => row),
    normalizedCsv,
    percentageAttendance: attendanceAsFractions,
    missingColumns,
  }
}
