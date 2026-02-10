import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const downloadExcel = (data, filename = 'attendance_report') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const downloadPDF = (data, title = 'Attendance Report', columns) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
  
  const tableData = data.map(row => columns.map(col => row[col.key] || ''));
  
  autoTable(doc, {
    head: [columns.map(col => col.label)],
    body: tableData,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] }
  });
  
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};
