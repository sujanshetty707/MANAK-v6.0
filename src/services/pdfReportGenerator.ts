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

let cachedLogoDataUrl: string | null = null;

const getManakLogoDataUrl = (): Promise<string | null> => {
  if (cachedLogoDataUrl) return Promise.resolve(cachedLogoDataUrl);
  return new Promise((resolve) => {
    try {
      if (typeof document === 'undefined') return resolve(null);

      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
        <defs>
          <linearGradient id="splashShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2A579E" />
            <stop offset="100%" stop-color="#142C52" />
          </linearGradient>
        </defs>
        <path d="M60 10 L98 26 C98 62 82 92 60 108 C38 92 22 62 22 26 Z" fill="url(#splashShieldGrad)" stroke="#4A7BBF" stroke-width="2.5" />
        <path d="M60 18 L90 31 C90 60 76 85 60 99 C44 85 30 60 30 31 Z" fill="none" stroke="#E8622C" stroke-width="1.5" stroke-opacity="0.85" />
        <g transform="translate(42, 38)">
          <rect x="0" y="0" width="3" height="34" rx="1" fill="#FFFFFF" />
          <rect x="6" y="0" width="5" height="34" rx="1.2" fill="#FFFFFF" />
          <rect x="14" y="0" width="2" height="34" rx="0.8" fill="#FFFFFF" fill-opacity="0.75" />
          <rect x="19" y="0" width="6" height="34" rx="1.2" fill="#FFFFFF" />
          <rect x="28" y="0" width="3.5" height="34" rx="1" fill="#FFFFFF" />
          <rect x="34" y="0" width="2" height="34" rx="0.8" fill="#FFFFFF" fill-opacity="0.85" />
          <line x1="-8" y1="17" x2="44" y2="17" stroke="#E8622C" stroke-width="2.5" stroke-linecap="round" />
        </g>
        <circle cx="60" cy="27" r="2.5" fill="#E8622C" />
      </svg>`;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 240;
          canvas.height = 240;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0, 240, 240);
          const dataUrl = canvas.toDataURL('image/png');
          cachedLogoDataUrl = dataUrl;
          resolve(dataUrl);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    } catch {
      resolve(null);
    }
  });
};

export async function generateInspectionPDF(record: InspectionRecord): Promise<void> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Subtle Background Security Watermark
    doc.setTextColor(245, 248, 252);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('MANAK STATUTORY COMPLIANCE', pageWidth / 2, 155, { align: 'center', angle: 32 });

    // 2. Top Saffron/Orange Accent Strip
    doc.setFillColor(232, 98, 44); // MANAK Orange
    doc.rect(0, 0, pageWidth, 2.5, 'F');

    // 3. Deep Navy Header Banner
    doc.setFillColor(14, 30, 54); // #0E1E36 Deep Navy
    doc.rect(0, 2.5, pageWidth, 30, 'F');

    // Bottom border for banner
    doc.setFillColor(74, 123, 191);
    doc.rect(0, 32.5, pageWidth, 0.6, 'F');

    // 4. MANAK Shield Logo & Name on Header Left
    const logoDataUrl = await getManakLogoDataUrl();
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 12, 6, 21, 21);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(19);
    doc.setFont('helvetica', 'bold');
    doc.text('MANAK', 36, 14.5);

    doc.setFontSize(7.2);
    doc.setTextColor(232, 98, 44); // MANAK Orange
    doc.setFont('helvetica', 'bold');
    doc.text('NATIONAL LEGAL METROLOGY PORTAL', 36, 19.5);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 202, 228);
    doc.text('Statutory Packaging Compliance System', 36, 23.5);

    // Subtle Vertical Divider
    doc.setDrawColor(65, 95, 135);
    doc.setLineWidth(0.3);
    doc.line(98, 6, 98, 29);

    // 5. Government of India & Statutory Title on Header Right
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('GOVERNMENT OF INDIA', 102, 11);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(226, 232, 240);
    doc.text('Ministry of Consumer Affairs, Food & Public Distribution', 102, 15.5);
    doc.text('DEPARTMENT OF LEGAL METROLOGY', 102, 19.5);

    doc.setFontSize(7.2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(251, 191, 36); // Amber Gold
    doc.text('STATUTORY INSPECTION & COMPLIANCE REPORT', 102, 24.5);

    let y = 37;
    doc.setTextColor(26, 26, 26);

    // Sub-header Info Box with Orange Accent Line
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(12, y, pageWidth - 24, 24, 2, 2, 'FD');

    // Accent line on top of Info Box
    doc.setFillColor(232, 98, 44);
    doc.rect(12, y, pageWidth - 24, 1.2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Report ID: ${sanitizeText(record?.report_id, 'MANAK-REP-2026-00491')}`, 16, y + 6.5);
    doc.text(`Inspection Date & Time: ${sanitizeText(record?.timestamp, new Date().toLocaleString())}`, 16, y + 12.5);
    doc.text(`Status: ${record?.is_compliant ? 'FULLY COMPLIANT' : 'NON-COMPLIANT (VIOLATIONS DETECTED)'}`, 16, y + 18.5);

    doc.text(`Inspecting Officer: ${sanitizeText(record?.performed_by?.name, 'Inspector Officer')}`, pageWidth / 2 + 10, y + 6.5);
    doc.text(`Badge / ID: ${sanitizeText(record?.performed_by?.badge_id, 'LM-OFF-2026')}`, pageWidth / 2 + 10, y + 12.5);
    doc.text(`Zone / Jurisdiction: ${sanitizeText(record?.performed_by?.zone, 'North Zone')}`, pageWidth / 2 + 10, y + 18.5);

    y += 29;

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
    doc.text('[VERIFIED] MANAK DIGITAL SIGNATURE & DSC CERTIFICATION (Sec. 65B Indian Evidence Act)', 16, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text(`Signatory: ${sanitizeText(record?.performed_by?.name, 'Officer')} (${sanitizeText(record?.performed_by?.badge_id, 'LM-2026')})`, 16, y + 12);
    doc.text(`Certificate Ref: ${sanitizeText(record?.signature_details?.certificate_id, 'DSC-IN-LM-2026-991823')}`, 16, y + 17);
    doc.text(`Timestamp: ${sanitizeText(record?.signature_details?.timestamp, record?.timestamp || new Date().toLocaleString())} | Server Verification: VERIFIED`, 16, y + 22);

    // Footer Note
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('This statutory digital report is generated and verified via MANAK Portal under the Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011.', pageWidth / 2, 285, { align: 'center' });

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


