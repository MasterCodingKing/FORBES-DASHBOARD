import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';

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
    const exportButtons = element.querySelectorAll('button, .export-button');
    const originalDisplays = [];
    exportButtons.forEach((btn) => {
      if (btn.textContent?.includes('Export') || btn.querySelector('svg[viewBox="0 0 24 24"]')) {
        originalDisplays.push(btn.style.display);
        btn.style.display = 'none';
      }
    });

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });

    // Restore buttons
    exportButtons.forEach((btn, idx) => {
      if (originalDisplays[idx] !== undefined) {
        btn.style.display = originalDisplays[idx];
      }
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
    const exportButtons = element.querySelectorAll('button, .export-button');
    const originalDisplays = [];
    exportButtons.forEach((btn) => {
      if (btn.textContent?.includes('Export') || btn.querySelector('svg[viewBox="0 0 24 24"]')) {
        originalDisplays.push(btn.style.display);
        btn.style.display = 'none';
      }
    });

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });

    // Restore buttons
    exportButtons.forEach((btn, idx) => {
      if (originalDisplays[idx] !== undefined) {
        btn.style.display = originalDisplays[idx];
      }
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
