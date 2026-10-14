export async function parseAcademicWorkbook(arrayBuffer) {
  const XLSX = await import('@e965/xlsx')
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  const firstSheet = firstSheetName ? workbook.Sheets[firstSheetName] : null
  if (!firstSheet) {
    throw new Error('Workbook Excel tidak memiliki sheet yang dapat dibaca.')
  }
  if (!firstSheet['!ref']) {
    throw new Error('Sheet pertama pada file Excel kosong.')
  }

  const range = XLSX.utils.decode_range(firstSheet['!ref'])
  if (range.e.r >= 10000 || range.e.c >= 20) {
    throw new Error('Sheet Excel terlalu besar. Batasnya 10.000 baris dan 20 kolom.')
  }

  const csvText = XLSX.utils.sheet_to_csv(firstSheet, {
    FS: ';',
    RS: '\r\n',
    blankrows: false,
  })
  if (!csvText.trim()) {
    throw new Error('Sheet pertama pada file Excel kosong.')
  }
  return csvText
}

export async function createAcademicWorkbook(headers, rows) {
  const XLSX = await import('@e965/xlsx')
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
  worksheet['!cols'] = headers.map(() => ({ wch: 20 }))
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Akademik')
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
}
