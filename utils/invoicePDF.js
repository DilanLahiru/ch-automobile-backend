const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a clean white-themed professional invoice PDF
 * White theme · Poppins typography · Footer pinned to page bottom
 * @param {Object} serviceRecord - Service record with details
 * @param {Object} customer      - Customer information
 * @param {string} filePath      - Output path for the PDF
 * @returns {Promise<string>}    - Resolves with the output path
 */
const generateInvoicePDF = async (serviceRecord, customer, filePath) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });

            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            const stream = fs.createWriteStream(filePath);
            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
            doc.pipe(stream);

            // ─────────────────────────────────────────────────────────────
            //  FONT SETUP  (Poppins + Roboto, Helvetica fallback)
            // ─────────────────────────────────────────────────────────────
            const fontDir = path.join(__dirname, '../assets/fonts');
            let hasPoppins = false;
            let hasRoboto = false;

            try {
                if (fs.existsSync(path.join(fontDir, 'Poppins-Regular.ttf'))) {
                    doc.registerFont('Pop',     path.join(fontDir, 'Poppins-Regular.ttf'));
                    doc.registerFont('Pop-Med', path.join(fontDir, 'Poppins-Medium.ttf'));
                    doc.registerFont('Pop-SB',  path.join(fontDir, 'Poppins-SemiBold.ttf'));
                    doc.registerFont('Pop-Bold',path.join(fontDir, 'Poppins-Bold.ttf'));
                    hasPoppins = true;
                }
            } catch (_) {}

            try {
                if (fs.existsSync(path.join(fontDir, 'Roboto-Regular.ttf'))) {
                    doc.registerFont('Rob',     path.join(fontDir, 'Roboto-Regular.ttf'));
                    doc.registerFont('Rob-Med', path.join(fontDir, 'Roboto-Medium.ttf'));
                    doc.registerFont('Rob-SB',  path.join(fontDir, 'Roboto-SemiBold.ttf'));
                    doc.registerFont('Rob-Bold',path.join(fontDir, 'Roboto-Bold.ttf'));
                    hasRoboto = true;
                }
            } catch (_) {}

            const F = {
                regular:   hasPoppins ? 'Pop'       : (hasRoboto ? 'Rob'       : 'Helvetica'),
                medium:    hasPoppins ? 'Pop-Med'   : (hasRoboto ? 'Rob-Med'   : 'Helvetica'),
                semibold:  hasPoppins ? 'Pop-SB'    : (hasRoboto ? 'Rob-SB'    : 'Helvetica-Bold'),
                bold:      hasPoppins ? 'Pop-Bold'  : (hasRoboto ? 'Rob-Bold'  : 'Helvetica-Bold'),
                roboto:    hasRoboto ? 'Rob'       : 'Helvetica',
                robotoBold:hasRoboto ? 'Rob-Bold'  : 'Helvetica-Bold',
                mono:      'Courier',
            };

            // ─────────────────────────────────────────────────────────────
            //  COLOUR PALETTE  (white theme)
            // ─────────────────────────────────────────────────────────────
            const C = {
                white:      '#ffffff',
                offWhite:   '#f7f8fb',
                hairline:   '#e4e6ef',
                muted:      '#9097b8',
                body:       '#4b5170',
                heading:    '#17193a',
                accent:     '#2a6f97',
                accentSoft: '#eff4ff',
                accentMid:  '#bfcffb',
                success:    '#059669',
                successBg:  '#ecfdf5',
                gold:       '#d97706',
                goldBg:     '#fffbeb',
            };

            // ─────────────────────────────────────────────────────────────
            //  PAGE GEOMETRY
            // ─────────────────────────────────────────────────────────────
            const PW       = 595.28;   // A4 width  (pt)
            const PH       = 841.89;   // A4 height (pt)
            const ML       = 44;       // left  margin
            const MR       = 44;       // right margin
            const CW       = PW - ML - MR;
            const FOOTER_H = 54;
            const FOOTER_Y = PH - FOOTER_H;

            // ─────────────────────────────────────────────────────────────
            //  HELPERS
            // ─────────────────────────────────────────────────────────────
            const fmt   = n => `Rs. ${Number(n || 0).toFixed(2)}`;
            const hline = (y, x1 = 0, x2 = PW, color = C.hairline, lw = 0.5) =>
                doc.moveTo(x1, y).lineTo(x2, y).strokeColor(color).lineWidth(lw).stroke();
            const vline = (x, y1, y2, color = C.hairline, lw = 0.5) =>
                doc.moveTo(x, y1).lineTo(x, y2).strokeColor(color).lineWidth(lw).stroke();

            // ─────────────────────────────────────────────────────────────
            //  INVOICE DATA
            // ─────────────────────────────────────────────────────────────
            const invoiceNumber = serviceRecord._id
                ? serviceRecord._id.toString().slice(-8).toUpperCase()
                : 'N/A';

            const rawStatus = (serviceRecord.status || 'COMPLETED').toUpperCase();
            const issueDate = new Date(serviceRecord.createdAt || new Date());
            const dueDate   = new Date(issueDate);
            dueDate.setDate(dueDate.getDate() + 30);
            const fmtDate   = d => d.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
            });

            // Financials – always recalculate, never trust stored totalAmount
            let partsSubtotal = 0;
            (serviceRecord.parts || []).forEach(p => {
                partsSubtotal += (p.price || 0) * (p.quantity || 0);
            });
            const laborCost  = serviceRecord.laborCost || 0;
            const pretax     = partsSubtotal + laborCost;
            const grandTotal = pretax;

            // ═════════════════════════════════════════════════════════════
            //  BACKGROUND + LEFT ACCENT RULE
            // ═════════════════════════════════════════════════════════════
            doc.rect(0, 0, PW, PH).fill(C.white);
            doc.rect(0, 0, 4, PH).fill(C.accent);   // 4 pt blue left stripe

            // ═════════════════════════════════════════════════════════════
            //  HEADER  (white, 106 pt tall)
            // ═════════════════════════════════════════════════════════════
            const HDR_H = 106;
            doc.rect(4, 0, PW - 4, HDR_H).fill(C.white);
            hline(HDR_H, 4, PW, C.hairline, 0.75);

            // Logo + Company Info (Left side)
            const LOGO_SIZE = 100;
            const LOGO_X = ML;
            const LOGO_Y = 16;
            const LOGO_PATH = path.join(__dirname, '../assets/logo.png');
            
            try {
                if (fs.existsSync(LOGO_PATH)) {
                    doc.image(LOGO_PATH, LOGO_X, LOGO_Y, { width: LOGO_SIZE, height: LOGO_SIZE });
                }
            } catch (e) {
                // Logo not found or error loading - continue without it
            }

            // Company info next to logo
            const INFO_X = LOGO_X + LOGO_SIZE + 16;
            const INFO_Y = LOGO_Y + 4;
            
            doc.font(F.bold).fontSize(16).fillColor(C.heading)
               .text('CH Automobile', INFO_X, INFO_Y);
            doc.font(F.regular).fontSize(7.5).fillColor(C.muted)
               .text('Drive without worries', INFO_X, INFO_Y + 18);
            doc.font(F.regular).fontSize(6.5).fillColor(C.body)
               .text('support@chautomobile.com  ·  +1 (555) 123-4567  ·  www.chautomobile.com', INFO_X, INFO_Y + 28);

            // "INVOICE" title + number (Right side)
            const INVOICE_RIGHT = PW - MR;
            const INVOICE_Y = LOGO_Y + 2;
            
            doc.font(F.bold).fontSize(32).fillColor(C.accent)
               .text('INVOICE', 0, INVOICE_Y, { width: INVOICE_RIGHT - 12, align: 'right' });
            
            doc.font(F.semibold).fontSize(9).fillColor(C.muted)
               .text(`Invoice #${invoiceNumber}`, 0, INVOICE_Y + 32, { width: INVOICE_RIGHT - 12, align: 'right' });

            // Status pill (right side, below invoice)
            const isPositive = ['COMPLETED', 'PAID', 'DONE'].includes(rawStatus);
            const pillBg     = isPositive ? C.successBg : C.goldBg;
            const pillFg     = isPositive ? C.success   : C.gold;
            const pillW      = 84;
            const pillX      = INVOICE_RIGHT - pillW;
            const pillY      = INVOICE_Y + 48;
            doc.roundedRect(pillX, pillY, pillW, 20, 10).fill(pillBg);
            doc.font(F.bold).fontSize(8).fillColor(pillFg)
               .text(rawStatus, pillX, pillY + 6, { width: pillW, align: 'center' });

            // ═════════════════════════════════════════════════════════════
            //  META BAND  (off-white, 4 cells)
            // ═════════════════════════════════════════════════════════════
            const META_H = 56;
            let y = HDR_H;
            doc.rect(4, y, PW - 4, META_H).fill(C.offWhite);
            hline(y + META_H, 4, PW, C.hairline, 0.75);

            const mColW = CW / 4;
            const mData = [
                { label: 'ISSUE DATE',   value: fmtDate(issueDate),                                      color: C.heading              },
               //  { label: 'DUE DATE',     value: fmtDate(dueDate),                                        color: C.accent               },
                { label: 'VEHICLE NO.',  value: (serviceRecord.vehicleNumber || '—').substring(0, 18),   color: C.heading, mono: true   },
                { label: 'SERVICE',      value: (serviceRecord.serviceDescription || '—').substring(0, 22), color: C.heading            },
            ];

            mData.forEach((col, i) => {
                const cx = ML + i * mColW + (i > 0 ? 12 : 0);
                if (i > 0) vline(ML + i * mColW, y + 14, y + META_H - 14);

                doc.font(F.semibold).fontSize(6.5).fillColor(C.muted)
                   .text(col.label, cx, y + 13, { width: mColW - 16 });

                doc.font(col.mono ? F.mono : F.semibold)
                   .fontSize(col.mono ? 9.5 : 10.5)
                   .fillColor(col.color)
                   .text(col.value, cx, y + 25, { width: mColW - 16, lineBreak: false });
            });

            y += META_H;

            // ═════════════════════════════════════════════════════════════
            //  BILL TO / SERVICE INFORMATION
            // ═════════════════════════════════════════════════════════════
            const ADDR_H = 84;
            doc.rect(4, y, PW - 4, ADDR_H).fill(C.white);
            hline(y + ADDR_H, 4, PW, C.hairline, 0.75);

            const halfCW = Math.floor(CW / 2);
            const col2X  = ML + halfCW + 16;

            // Left – Bill To
            doc.rect(ML, y + 16, 3, 14).fill(C.accent);
            doc.font(F.bold).fontSize(6.5).fillColor(C.accent)
               .text('BILL TO', ML + 10, y + 16);
            doc.font(F.bold).fontSize(13).fillColor(C.heading)
               .text(customer.name || 'N/A', ML + 10, y + 28, { width: halfCW - 16 });
            doc.font(F.regular).fontSize(9).fillColor(C.body)
               .text(customer.email || 'N/A', ML + 10, y + 45)
               .text(`Tel: ${customer.contactNumber || 'N/A'}`, ML + 10, y + 58);

            // Right – Service Information
            vline(ML + halfCW, y + 16, y + ADDR_H - 16);
            doc.rect(col2X - 6, y + 16, 3, 14).fill(C.accent);
            doc.font(F.bold).fontSize(6.5).fillColor(C.accent)
               .text('SERVICE INFORMATION', col2X, y + 16);
            doc.font(F.bold).fontSize(13).fillColor(C.heading)
               .text(serviceRecord.serviceDescription || 'General Service', col2X, y + 28, { width: halfCW - 20 });
            doc.font(F.regular).fontSize(9).fillColor(C.body)
               .text(`Vehicle: ${serviceRecord.vehicleNumber || 'N/A'}`, col2X, y + 45)
               .text(`Status: ${rawStatus}`, col2X, y + 58).fillColor(C.success);

            y += ADDR_H;

            // ═════════════════════════════════════════════════════════════
            //  LINE ITEMS TABLE
            // ═════════════════════════════════════════════════════════════

            // Column geometry — anchored right → left so nothing overflows
            const CA_W = 84;                        // Amount
            const CP_W = 84;                        // Unit Price
            const CQ_W = 42;                        // Qty
            const CA_X = PW - MR - CA_W;            // Amount left edge
            const CP_X = CA_X - CP_W - 8;           // Unit Price left edge
            const CQ_X = CP_X - CQ_W - 8;           // Qty left edge
            const CD_W = CQ_X - ML - 8;             // Description width

            // Table header row
            const TH_H = 26;
            doc.rect(4, y, PW - 4, TH_H).fill(C.accent);
            doc.font(F.semibold).fontSize(7.5).fillColor(C.white);
            doc.text('Description', ML,   y + 9, { width: CD_W                    });
            doc.text('Qty',         CQ_X, y + 9, { width: CQ_W, align: 'center'   });
            doc.text('Unit Price',  CP_X, y + 9, { width: CP_W, align: 'right'    });
            doc.text('Amount',      CA_X, y + 9, { width: CA_W, align: 'right'    });
            y += TH_H;

            // Data rows
            const ROW_H = 25;
            const parts = serviceRecord.parts || [];

            if (parts.length > 0) {
                parts.forEach((part, idx) => {
                    const lineTotal = (part.price || 0) * (part.quantity || 0);
                    const rowBg     = idx % 2 === 0 ? C.white : C.offWhite;
                    doc.rect(4, y, PW - 4, ROW_H).fill(rowBg);

                    const ry = y + 8;

                    // Description
                    doc.font(F.mono).fontSize(9.5).fillColor(C.heading)
                       .text((part.name || 'N/A').substring(0, 52), ML, ry, {
                           width: CD_W, lineBreak: false,
                       });

                    // Qty pill
                    const qtyStr = String(part.quantity || 0);
                    const pillW2 = Math.max(26, doc.widthOfString(qtyStr) + 14);
                    const pillX2 = CQ_X + (CQ_W - pillW2) / 2;
                    doc.roundedRect(pillX2, y + 6, pillW2, 14, 4).fill(C.accentSoft);
                    doc.font(F.mono).fontSize(9).fillColor(C.accent)
                       .text(qtyStr, CQ_X, ry, { width: CQ_W, align: 'center' });

                    // Unit price
                    doc.font(F.regular).fontSize(9.5).fillColor(C.body)
                       .text(fmt(part.price || 0), CP_X, ry, { width: CP_W, align: 'right' });

                    // Line total
                    doc.font(F.semibold).fontSize(9.5).fillColor(C.heading)
                       .text(fmt(lineTotal), CA_X, ry, { width: CA_W, align: 'right' });

                    hline(y + ROW_H, ML, PW - MR, C.hairline, 0.35);
                    y += ROW_H;
                });
            } else {
                doc.rect(4, y, PW - 4, 36).fill(C.offWhite);
                doc.font(F.regular).fontSize(9.5).fillColor(C.muted)
                   .text('No parts or services recorded for this invoice.', ML, y + 13, {
                       width: CW, align: 'center',
                   });
                y += 36;
            }

            y += 14;
            hline(y, 4, PW, C.hairline, 0.75);
            y += 16;

            // ═════════════════════════════════════════════════════════════
            //  PAYMENT TERMS  +  TOTALS
            // ═════════════════════════════════════════════════════════════
            const NOTES_CW = Math.floor(CW * 0.48);
            const AMT_X    = ML + NOTES_CW + 28;
            const AMT_W    = PW - MR - AMT_X;

            // — Payment terms (left) —
            doc.font(F.bold).fontSize(6.5).fillColor(C.muted)
               .text('PAYMENT TERMS', ML, y);

            const noteLines = [
                'Payment due upon vehicle pickup.',
                'Cash, credit cards & digital payments accepted.',
                 'Please contact us if you have any questions about this invoice.',
            ];
            noteLines.forEach((ln, i) => {
                const ny = y + 14 + i * 15;
                doc.circle(ML + 4, ny + 4.5, 2).fill(C.hairline);
                doc.font(F.mono).fontSize(8.5).fillColor(C.body)
                   .text(ln, ML + 12, ny, { width: NOTES_CW - 14 });
            });

            // — Amounts (right) —
            const drawAmt = (label, value, offsetY) => {
                doc.font(F.mono).fontSize(9).fillColor(C.heading)
                   .text(label, AMT_X, y + offsetY);
                doc.font(F.mono).fontSize(9).fillColor(C.heading)
                   .text(value, AMT_X, y + offsetY, { width: AMT_W, align: 'right' });
            };

            drawAmt('Parts Subtotal', fmt(partsSubtotal), 0);

            let amtOff = 16;
            if (laborCost > 0) {
                drawAmt('Labor Cost', fmt(laborCost), amtOff);
                amtOff += 16;
            }

            hline(y + amtOff, AMT_X, PW - MR, C.hairline, 0.5);
            amtOff += 8;

            drawAmt('Subtotal', fmt(pretax),    amtOff);      amtOff += 15;
            // drawAmt('Tax (5%)', fmt(taxAmount), amtOff);      amtOff += 20;

            // Grand total box
            const GT_TOP_MARGIN = 12;
            const GT_Y = y + amtOff + GT_TOP_MARGIN;
            doc.roundedRect(AMT_X - 10, GT_Y, AMT_W + 10, 36, 6).fill(C.accent);
            doc.font(F.mono).fontSize(17).fillColor(C.white)
               .text(fmt(grandTotal), AMT_X, GT_Y + 10, { width: AMT_W, align: 'right' });

            // ═════════════════════════════════════════════════════════════
            //  FOOTER  — absolutely pinned to bottom of page
            // ═════════════════════════════════════════════════════════════
            doc.rect(0, FOOTER_Y, PW, FOOTER_H).fill(C.offWhite);
            doc.rect(0, FOOTER_Y, 4, FOOTER_H).fill(C.accent);
            hline(FOOTER_Y, 0, PW, C.hairline, 0.75);

            // Footer left
            doc.font(F.regular).fontSize(8.5).fillColor(C.body)
               .text(
                   'Thank you for choosing CH Automobile — Drive without worries.',
                   ML, FOOTER_Y + 11, { width: CW * 0.56 },
               );
            doc.font(F.regular).fontSize(7.5).fillColor(C.muted)
               .text(
                   'support@chautomobile.com  ·  www.chautomobile.com  ·  +1 (555) 123-4567',
                   ML, FOOTER_Y + 26,
               );

            // Footer right
            doc.font(F.semibold).fontSize(8.5).fillColor(C.heading)
               .text(`Invoice #${invoiceNumber}`, 0, FOOTER_Y + 11, { width: PW - MR, align: 'right' });
            doc.font(F.regular).fontSize(7.5).fillColor(C.muted)
               .text(
                   `Generated: ${new Date().toLocaleDateString('en-US')}  ·  Page 1 of 1`,
                   0, FOOTER_Y + 26, { width: PW - MR, align: 'right' },
               );

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateInvoicePDF };
