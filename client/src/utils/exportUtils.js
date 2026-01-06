import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';
import jsPDF from 'jspdf';

/**
 * Export element as PNG image
 */
export const exportToPNG = async (elementId, filename = 'chart') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    // Find and hide all export buttons temporarily
    const exportButtonWrappers = element.querySelectorAll('.export-button-wrapper');
    const originalDisplays = [];
    exportButtonWrappers.forEach((wrapper) => {
      originalDisplays.push(wrapper.style.display);
      wrapper.style.display = 'none';
    });

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });

    // Restore buttons
    exportButtonWrappers.forEach((wrapper, idx) => {
      wrapper.style.display = originalDisplays[idx] || '';
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    throw error;
  }
};

/**
 * Export element as PDF
 */
export const exportToPDF = async (elementId, filename = 'report', title = 'Report') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    // Find and hide all export buttons temporarily
    const exportButtonWrappers = element.querySelectorAll('.export-button-wrapper');
    const originalDisplays = [];
    exportButtonWrappers.forEach((wrapper) => {
      originalDisplays.push(wrapper.style.display);
      wrapper.style.display = 'none';
    });

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });

    // Restore buttons
    exportButtonWrappers.forEach((wrapper, idx) => {
      wrapper.style.display = originalDisplays[idx] || '';
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Calculate PDF dimensions (A4 size in mm)
    const pdfWidth = 210;
    const pdfHeight = 297;
    
    // Calculate aspect ratio
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const scaledWidth = imgWidth * ratio * 0.95; // 95% to add margins
    const scaledHeight = imgHeight * ratio * 0.95;

    // Create PDF with appropriate orientation
    const orientation = scaledWidth > scaledHeight ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    const pageWidth = orientation === 'landscape' ? pdfHeight : pdfWidth;
    const pageHeight = orientation === 'landscape' ? pdfWidth : pdfHeight;
    pdf.text(title, pageWidth / 2, 15, { align: 'center' });

    // Add date
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, 22, { align: 'center' });

    // Calculate position to center the image
    const xPos = (pageWidth - scaledWidth) / 2;
    const yPos = 30;

    // Add the image
    pdf.addImage(imgData, 'PNG', xPos, yPos, scaledWidth, scaledHeight);

    // Save the PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

/**
 * Export data to Excel
 */
export const exportToExcel = (data, filename = 'data') => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

/**
 * Export table data to Excel
 */
export const exportTableToExcel = (tableId, filename = 'table') => {
  try {
    const table = document.getElementById(tableId);
    if (!table) {
      console.error('Table not found');
      return;
    }

    const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting table to Excel:', error);
    throw error;
  }
};

/**
 * Export element to PowerPoint
 */
export const exportToPPT = async (elementId, filename = 'presentation', title = 'Chart') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    // Find and hide all export buttons temporarily
    const exportButtonWrappers = element.querySelectorAll('.export-button-wrapper');
    const originalDisplays = [];
    exportButtonWrappers.forEach((wrapper) => {
      originalDisplays.push(wrapper.style.display);
      wrapper.style.display = 'none';
    });

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });

    // Restore buttons
    exportButtonWrappers.forEach((wrapper, idx) => {
      wrapper.style.display = originalDisplays[idx] || '';
    });

    const pptx = new pptxgen();
    const slide = pptx.addSlide();

    // Add title
    slide.addText(title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: '363636'
    });

    // Add image
    const imgData = canvas.toDataURL('image/png');
    slide.addImage({
      data: imgData,
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 5
    });

    await pptx.writeFile({ fileName: `${filename}.pptx` });
  } catch (error) {
    console.error('Error exporting to PowerPoint:', error);
    throw error;
  }
};

/**
 * Export data array to PowerPoint with table
 */
export const exportDataToPPT = async (data, filename = 'data', title = 'Data Table') => {
  try {
    const pptx = new pptxgen();
    const slide = pptx.addSlide();

    // Add title
    slide.addText(title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: '363636'
    });

    // Convert data to table format
    if (data && data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = [headers, ...data.map(row => headers.map(h => row[h]?.toString() || ''))];

      slide.addTable(rows, {
        x: 0.5,
        y: 1.2,
        w: 9,
        fontSize: 10,
        color: '363636',
        fill: { color: 'F7F7F7' },
        border: { pt: 1, color: 'CFCFCF' }
      });
    }

    await pptx.writeFile({ fileName: `${filename}.pptx` });
  } catch (error) {
    console.error('Error exporting data to PowerPoint:', error);
    throw error;
  }
};
