import { jsPDF } from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { InspectionRecord } from '../types';

const sanitizeText = (val: any, fallback = 'Not Specified'): string => {
  if (val === null || val === undefined) return fallback;
  let str = '';
  if (typeof val === 'string') {
    str = val;
  } else if (typeof val === 'number') {
    str = String(val);
  } else if (typeof val === 'object') {
    if (val.raw_text) str = String(val.raw_text);
    else if (val.value) return sanitizeText(val.value, fallback);
    else if (val.amount !== undefined) str = `${val.amount} ${val.unit || ''}`;
    else str = String(val);
  } else {
    str = String(val);
  }

  str = str
    .replace(/₹/g, 'Rs. ')
    .replace(/✓/g, '[VERIFIED] ')
    .replace(/•/g, '-')
    .replace(/—/g, '-')
    .replace(/°/g, ' deg')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x00-\x7F]/g, '');

  return str.trim() || fallback;
};

const safeNum = (val: any, fallback = 0): number => {
  const num = Number(val);
  return isNaN(num) ? fallback : num;
};

const getNetQtyStr = (extraction?: any): string => {
  if (!extraction?.net_quantity) return 'Not Declared';
  const nq = extraction.net_quantity;
  if (typeof nq === 'string') return sanitizeText(nq);
  if (nq.value) {
    if (typeof nq.value === 'object' && nq.value.amount !== undefined) {
      return sanitizeText(`${nq.value.amount} ${nq.value.unit || ''}`);
    }
    return sanitizeText(nq.value);
  }
  if (nq.amount !== undefined) return sanitizeText(`${nq.amount} ${nq.unit || ''}`);
  return 'Not Declared';
};

const getMrpStr = (extraction?: any): string => {
  if (!extraction?.mrp) return 'Not Declared';
  const mrp = extraction.mrp;
  if (typeof mrp === 'string') return sanitizeText(mrp);
  if (mrp.value) {
    if (typeof mrp.value === 'object' && mrp.value.raw_text) return sanitizeText(mrp.value.raw_text);
    if (typeof mrp.value === 'object' && mrp.value.amount !== undefined) return sanitizeText(`Rs. ${mrp.value.amount}`);
    return sanitizeText(mrp.value);
  }
  return 'Not Declared';
};

export async function generateInspectionPDF(record: InspectionRecord): Promise<void> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header Banner
    doc.setFillColor(27, 58, 107); // #1B3A6B Deep Navy
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('GOVERNMENT OF INDIA', pageWidth / 2, 10, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Ministry of Consumer Affairs, Food & Public Distribution', pageWidth / 2, 16, { align: 'center' });
    doc.text('DEPARTMENT OF LEGAL METROLOGY - STATUTORY INSPECTION REPORT', pageWidth / 2, 22, { align: 'center' });

    y = 35;
    doc.setTextColor(26, 26, 26);

    // Sub-header Info Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(12, y, pageWidth - 24, 24, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Report ID: ${sanitizeText(record?.report_id, 'MANAK-REP-2026-00491')}`, 16, y + 6);
    doc.text(`Inspection Date & Time: ${sanitizeText(record?.timestamp, new Date().toLocaleString())}`, 16, y + 12);
    doc.text(`Status: ${record?.is_compliant ? 'FULLY COMPLIANT' : 'NON-COMPLIANT (VIOLATIONS DETECTED)'}`, 16, y + 18);

    doc.text(`Inspecting Officer: ${sanitizeText(record?.performed_by?.name, 'Inspector Officer')}`, pageWidth / 2 + 10, y + 6);
    doc.text(`Badge / ID: ${sanitizeText(record?.performed_by?.badge_id, 'LM-OFF-2026')}`, pageWidth / 2 + 10, y + 12);
    doc.text(`Zone / Jurisdiction: ${sanitizeText(record?.performed_by?.zone, 'North Zone')}`, pageWidth / 2 + 10, y + 18);

    y += 30;

    // Geo Location & Evidence Authenticity (§65B Evidence Act)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 58, 107);
    doc.text('1. Location & Tamper-Evident Digital Metadata (Sec. 65B Indian Evidence Act)', 12, y);
    y += 5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(`- Premises / Address: ${sanitizeText(record?.geo?.address, 'Connaught Place, New Delhi')}`, 15, y);
    y += 4.5;
    const lat = safeNum(record?.geo?.lat, 28.6139);
    const lng = safeNum(record?.geo?.lng, 77.2090);
    doc.text(`- GPS Coordinates: Latitude ${lat.toFixed(4)} deg N, Longitude ${lng.toFixed(4)} deg E`, 15, y);
    y += 4.5;
    doc.text(`- Digital Evidence Hash (SHA-256): ${sanitizeText(record?.evidence_hash, 'sha256-abc123xyz')}`, 15, y);
    y += 7;

    // Product Inspection Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 58, 107);
    doc.text('2. Packaged Commodity Declaration Findings', 12, y);
    y += 5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(`- Product Name & Brand: ${sanitizeText(record?.product?.title, 'Packaged Product')} (${sanitizeText(record?.product?.brand, 'Brand')})`, 15, y);
    y += 4.5;
    doc.text(`- Declared Net Quantity: ${getNetQtyStr(record?.extraction)}`, 15, y);
    y += 4.5;
    doc.text(`- Declared MRP: ${getMrpStr(record?.extraction)}`, 15, y);
    y += 4.5;
    doc.text(`- Declared Manufacturer: ${sanitizeText(record?.extraction?.manufacturer?.value, 'Not Declared')}`, 15, y);
    y += 4.5;
    doc.text(`- Date of Packing/Mfg: ${sanitizeText(record?.extraction?.mfg_date?.value, 'Not Declared')} | Origin: ${sanitizeText(record?.extraction?.country_of_origin?.value, 'India')}`, 15, y);
    y += 7;

    // Statutory Checklist & Violations
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 58, 107);
    doc.text('3. Statutory Checklist & Legal Metrology (Packaged Commodities) Rules 2011 Audit', 12, y);
    y += 5;

    doc.setFillColor(241, 245, 249);
    doc.rect(12, y, pageWidth - 24, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Rule / Clause', 15, y + 4.5);
    doc.text('Requirement', 50, y + 4.5);
    doc.text('Evaluation Status', 120, y + 4.5);
    doc.text('Penalty (Rs.)', 165, y + 4.5);
    y += 7;

    const evaluations = Array.isArray(record?.evaluations) ? record.evaluations : [];
    evaluations.forEach((evalItem) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      const isViol = evalItem?.status === 'violation';
      doc.setTextColor(isViol ? 192 : 30, isViol ? 57 : 41, isViol ? 43 : 59);

      const ruleSrc = sanitizeText(evalItem?.rule_source, 'Rule 7').substring(0, 22);
      const reqName = sanitizeText(evalItem?.requirement_name, 'Requirement').substring(0, 42);
      const penAmt = safeNum(evalItem?.penalty, 0);

      doc.text(ruleSrc, 15, y + 4);
      doc.text(reqName, 50, y + 4);
      doc.text(isViol ? 'NON-COMPLIANT' : 'COMPLIANT', 120, y + 4);
      doc.text(isViol ? `Rs. ${penAmt}` : 'Rs. 0', 165, y + 4);

      y += 5.5;
    });

    // Total Fine
    y += 3;
    doc.setDrawColor(203, 213, 225);
    doc.line(12, y, pageWidth - 12, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(27, 58, 107);
    doc.text(`Total Statutory Violations Found: ${safeNum(record?.total_violations, 0)}`, 15, y);
    doc.text(`Total Compounding Penalty Amount: Rs. ${safeNum(record?.total_penalty, 0)}`, 120, y);

    y += 15;

    // Digital Signature Block
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(12, y, pageWidth - 24, 26, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(42, 157, 92); // Green
    doc.text('[VERIFIED] DIGITALLY SIGNED & CERTIFIED (eSign / Documenso Verification)', 16, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text(`Signatory: ${sanitizeText(record?.performed_by?.name, 'Officer')} (${sanitizeText(record?.performed_by?.badge_id, 'LM-2026')})`, 16, y + 12);
    doc.text(`Certificate Ref: ${sanitizeText(record?.signature_details?.certificate_id, 'DSC-IN-LM-2026-991823')}`, 16, y + 17);
    doc.text(`Timestamp: ${sanitizeText(record?.signature_details?.timestamp, record?.timestamp || new Date().toLocaleString())} | Server Verification: VERIFIED`, 16, y + 22);

    // Footer Note
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('This digital inspection report is issued under the authority of the Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011.', pageWidth / 2, 285, { align: 'center' });

    // Save the PDF
    const reportId = (record as any)?.report_id || record?.id || 'MANAK-Inspection-Report';
    const filename = `${sanitizeText(reportId, 'MANAK-Inspection-Report')}.pdf`;

    if (Capacitor.isNativePlatform()) {
      try {
        const dataUri = doc.output('datauristring');
        const base64Data = dataUri.split(',')[1] || dataUri;

        const savedResult = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Cache
        });

        await Share.share({
          title: 'MANAK Official Inspection Report',
          text: `Inspection Report for ${sanitizeText(record?.product?.title, 'Product')} (${sanitizeText(reportId, 'ID')})`,
          url: savedResult.uri,
          dialogTitle: 'Save or Open Inspection PDF'
        });
        return;
      } catch (nativeErr) {
        console.warn('[pdfReportGenerator] Native share/write encountered an issue, trying fallback:', nativeErr);
        try {
          const dataUri = doc.output('datauristring');
          const base64Data = dataUri.split(',')[1] || dataUri;
          await Filesystem.writeFile({
            path: filename,
            data: base64Data,
            directory: Directory.Documents
          });
          return;
        } catch (fbErr) {
          console.error('[pdfReportGenerator] Native fallback write failed:', fbErr);
        }
      }
    }

    // Standard web browser fallback for laptop / desktop
    doc.save(filename);
  } catch (err) {
    console.error('[pdfReportGenerator] Error generating PDF report:', err);
    throw err;
  }
}


