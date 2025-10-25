import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], filename: string, sheetName = 'Sheet1') {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// Multi-sheet export
export function exportMultiSheetExcel(sheets: { name: string; data: any[] }[], filename: string) {
  const wb = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    const ws = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  XLSX.writeFile(wb, `${filename}.xlsx`);
}