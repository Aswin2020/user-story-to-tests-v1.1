import { TestCase } from './types'
import * as XLSX from 'xlsx'

export function downloadAsCSV(testCases: TestCase[], storyTitle: string) {
  // Prepare CSV data
  const csvData: string[] = []
  
  // Add header
  csvData.push('Story Title', storyTitle)
  csvData.push('')
  csvData.push('Test Case ID,Story Name,Title,Category,Expected Result,Steps,Test Data')
  
  // Add test cases
  testCases.forEach((testCase) => {
    const stepsStr = testCase.steps.join(' | ')
    const testDataStr = testCase.testData || 'N/A'
    const storyName = testCase.storyName || 'N/A'
    const row = [
      testCase.id,
      storyName,
      testCase.title,
      testCase.category,
      testCase.expectedResult,
      stepsStr,
      testDataStr
    ]
    csvData.push(row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  })
  
  // Create blob and download
  const csvContent = csvData.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${sanitizeFilename(storyTitle)}_test_cases.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function downloadAsXLS(testCases: TestCase[], storyTitle: string) {
  // Prepare data for Excel
  const worksheetData: any[] = [
    ['Story Title', storyTitle],
    [''],
    ['Test Case ID', 'Story Name', 'Title', 'Category', 'Expected Result', 'Steps', 'Test Data']
  ]
  
  testCases.forEach((testCase) => {
    const stepsStr = testCase.steps.join(' | ')
    const testDataStr = testCase.testData || 'N/A'
    const storyName = testCase.storyName || 'N/A'
    worksheetData.push([
      testCase.id,
      storyName,
      testCase.title,
      testCase.category,
      testCase.expectedResult,
      stepsStr,
      testDataStr
    ])
  })
  
  // Create workbook and worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
  
  // Set column widths
  const colWidths = [
    { wch: 15 },  // Test Case ID
    { wch: 25 },  // Story Name
    { wch: 30 },  // Title
    { wch: 15 },  // Category
    { wch: 30 },  // Expected Result
    { wch: 50 },  // Steps
    { wch: 25 }   // Test Data
  ]
  worksheet['!cols'] = colWidths
  
  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Cases')
  
  // Download
  XLSX.writeFile(workbook, `${sanitizeFilename(storyTitle)}_test_cases.xlsx`)
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100)
}
