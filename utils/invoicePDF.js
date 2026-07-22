// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");

// const generateInvoicePDF = async (serviceRecord, customer, filePath) => {
//   return new Promise((resolve, reject) => {
//     try {
//       const doc = new PDFDocument({ size: "A4", margin: 0 });

//       const dir = path.dirname(filePath);
//       if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

//       const stream = fs.createWriteStream(filePath);
//       doc.pipe(stream);

//       stream.on("finish", () => resolve(filePath));
//       stream.on("error", reject);

//       // ─────────────────────────────────────────
//       // REGISTER FONTS
//       // ─────────────────────────────────────────
//       const fontDir = path.join(__dirname, "../assets/fonts");
//       doc.registerFont("Poppins", path.join(fontDir, "Poppins-Regular.ttf"));

//       // ─────────────────────────────────────────
//       // COLORS & STYLING
//       // ─────────────────────────────────────────
//       const C = {
//         primary: "#126799",
//         primaryLight: "#0c3577",
//         accent: "#c8ddfc",
//         text: "#1f2937",
//         subText: "#6b7280",
//         lightText: "#9ca3af",
//         border: "#e5e7eb",
//         bgLight: "#f9fafb",
//         bgLighter: "#f3f4f6",
//         white: "#ffffff",
//         success: "#10b981"
//       };

//       // ─────────────────────────────────────────
//       // LAYOUT
//       // ─────────────────────────────────────────
//       const PW = 595.28;
//       const PH = 841.89;
//       const ML = 45;
//       const MR = 45;
//       const CW = PW - ML - MR;

//       let y = 0;

//       // ─────────────────────────────────────────
//       // FORMATTERS
//       // ─────────────────────────────────────────
//       const fmt = (n) =>
//         new Intl.NumberFormat("en-LK", {
//           style: "currency",
//           currency: "LKR",
//         }).format(n || 0);

//       const formatDate = (d) =>
//         new Date(d).toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//         });

//       // ─────────────────────────────────────────
//       // TOP ACCENT BANNER
//       // ─────────────────────────────────────────
//       doc.rect(0, 0, PW, 8).fill(C.primary);
//       y = 8;

//       // ─────────────────────────────────────────
//       // HEADER WITH LOGO & COMPANY INFO
//       // ─────────────────────────────────────────
//       y += 20;
//       const logoPath = path.join(__dirname, "../assets/Logo.png");
//       const logoSize = 220;

//       if (fs.existsSync(logoPath)) {
//         doc.image(logoPath, ML, y, {
//           fit: [logoSize, logoSize],
//         });
//       }

//       // Invoice Badge on Right
//       doc.rect(PW - MR - 140, y, 140, 88).fill(C.bgLighter);
//       doc.rect(PW - MR - 140, y, 140, 5).fill(C.primary);

//     //   const invoiceNumber = serviceRecord._id
//     //     ? serviceRecord._id.toString().slice(-6)
//     //     : "000001";
//     // Generate a random 6-digit invoice number for demonstration purposes
//     const invoiceNumber = Math.floor(Math.random() * 1000000);

//       doc.fontSize(10).fillColor(C.subText).font("Poppins")
//         .text("INVOICE", PW - MR - 135, y + 8);

//       doc.fontSize(10).fillColor(C.primary).font("Poppins")
//         .text(`#${invoiceNumber}`, PW - MR - 135, y + 22);

//       doc.fontSize(8).fillColor(C.lightText)
//         .text(`Issued: ${formatDate(serviceRecord.createdAt)}`, PW - MR - 135, y + 38)
//         .text(`Status: Completed`, PW - MR - 135, y + 50)
//         .text(`Payment Amount: ${fmt(serviceRecord.laborCost + (serviceRecord.parts || []).reduce((sum, p) => sum + (p.price * p.quantity), 0))}`, PW - MR - 135, y + 62);

//       y += 110;

//       // ─────────────────────────────────────────
//       // DIVIDER
//       // ─────────────────────────────────────────
//       doc.moveTo(ML, y).lineTo(PW - MR, y).stroke(C.border);
//       y += 20;

//       // ─────────────────────────────────────────
//       // BILL TO & SERVICE DETAILS (2 COLUMNS)
//       // ─────────────────────────────────────────
//       const col1X = ML;
//       const col2X = ML + CW / 2 + 15;

//       // Bill To
//       doc.fontSize(10).fillColor(C.primary).font("Poppins")
//         .text("BILL TO", col1X, y);

//       doc.fontSize(12).fillColor(C.text).font("Poppins")
//         .text(customer.name || "N/A", col1X, y + 18);

//       doc.fontSize(9).fillColor(C.subText)
//         .text(customer.email || "N/A", col1X, y + 38)
//         .text(customer.contactNumber || "N/A", col1X, y + 52)
//         .text("Vehicle Owner", col1X, y + 70);

//       // Service Details
//       doc.fontSize(10).fillColor(C.primary).font("Poppins")
//         .text("SERVICE DETAILS", col2X, y);

//       doc.fontSize(9).fillColor(C.subText)
//         .text("Vehicle Number:", col2X, y + 18);
//       doc.fontSize(10).fillColor(C.text).font("Poppins")
//         .text(serviceRecord.vehicleNumber || "-", col2X, y + 30);

//       doc.fontSize(9).fillColor(C.subText)
//         .text("Service Type:", col2X, y + 48);
//       doc.fontSize(10).fillColor(C.text).font("Poppins")
//         .text(serviceRecord.serviceDescription || "-", col2X, y + 60);

//       y += 90;

//       // ─────────────────────────────────────────
//       // DIVIDER
//       // ─────────────────────────────────────────
//       doc.moveTo(ML, y).lineTo(PW - MR, y).stroke(C.border);
//       y += 15;

//       // ─────────────────────────────────────────
//       // ITEMS TABLE
//       // ─────────────────────────────────────────
//       const tableY = y;
//       const colDescX = ML;
//       const colQtyX = ML + 260;
//       const colPriceX = ML + 320;
//       const colTotalX = ML + 400;

//       // Header
//       doc.rect(ML, tableY, CW, 32).fill(C.primary);

//       doc.fontSize(11).fillColor(C.white).font("Poppins")
//         .text("Description", colDescX + 12, tableY + 10)
//         .text("Qty", colQtyX + 8, tableY + 10)
//         .text("Unit Price", colPriceX + 5, tableY + 10)
//         .text("Total", colTotalX + 15, tableY + 10);

//       y = tableY + 32;

//       // ─────────────────────────────────────────
//       // TABLE ROWS
//       // ─────────────────────────────────────────
//       let partsSubtotal = 0;
//       const parts = serviceRecord.parts || [];

//       if (parts.length === 0) {
//         doc.rect(ML, y, CW, 30).fill(C.bgLighter);
//         doc.fontSize(10).fillColor(C.subText)
//           .text("No items in this service record", colDescX + 12, y + 10);
//         y += 30;
//       } else {
//         parts.forEach((p, i) => {
//           const total = (p.price || 0) * (p.quantity || 0);
//           partsSubtotal += total;

//           const rowBg = i % 2 === 0 ? C.bgLight : C.white;
//           doc.rect(ML, y, CW, 30).fill(rowBg);

//           doc.fontSize(10).fillColor(C.text)
//             .text(p.name || "-", colDescX + 12, y + 8)
//             .text((p.quantity || 0).toString(), colQtyX + 8, y + 8)
//             .text(fmt(p.price || 0), colPriceX + 5, y + 8)
//             .text(fmt(total), colTotalX + 15, y + 8);

//           y += 30;
//         });
//       }

//       y += 10;

//       // ─────────────────────────────────────────
//       // DIVIDER
//       // ─────────────────────────────────────────
//       doc.moveTo(ML, y).lineTo(PW - MR, y).stroke(C.border);
//       y += 15;

//       // ─────────────────────────────────────────
//       // SUMMARY BOX
//       // ─────────────────────────────────────────
//       const laborCost = serviceRecord.laborCost || 0;
//       const totalAmount = partsSubtotal + laborCost;

//       const summaryX = PW - MR - 180;
//       const summaryY = y;

//       // Container
//       doc.rect(summaryX, summaryY, 180, 90).fill(C.bgLighter);
//       doc.rect(summaryX, summaryY, 180, 4).fill(C.primaryLight);

//       // Subtotal
//       doc.fontSize(9).fillColor(C.subText).font("Poppins")
//         .text("Subtotal:", summaryX + 12, summaryY + 12);
//       doc.fontSize(10).fillColor(C.text).font("Poppins")
//         .text(fmt(partsSubtotal), summaryX + 12, summaryY + 12, {
//           width: 156,
//           align: "right"
//         });

//       // Labor
//       doc.fontSize(9).fillColor(C.subText)
//         .text("Labor Cost:", summaryX + 12, summaryY + 30);
//       doc.fontSize(10).fillColor(C.text).font("Poppins")
//         .text(fmt(laborCost), summaryX + 12, summaryY + 30, {
//           width: 156,
//           align: "right"
//         });

//       // Line
//       doc.moveTo(summaryX + 12, summaryY + 50).lineTo(summaryX + 168, summaryY + 50)
//         .stroke(C.border);

//       // Total
//       doc.fontSize(11).fillColor(C.primary).font("Poppins")
//         .text("TOTAL:", summaryX + 12, summaryY + 60);
//       doc.fontSize(14).fillColor(C.primary).font("Poppins")
//         .text(fmt(totalAmount), summaryX + 12, summaryY + 60, {
//           width: 156,
//           align: "right"
//         });

//       // ─────────────────────────────────────────
//       // FOOTER SECTION
//       // ─────────────────────────────────────────
//       doc.moveTo(ML, PH - 80).lineTo(PW - MR, PH - 80).stroke(C.border);

//       doc.fontSize(10).fillColor(C.text).font("Poppins")
//         .text("Thank you for your business!", ML, PH - 70);

//       doc.fontSize(8).fillColor(C.subText)
//         .text("We appreciate your trust. For any queries, contact us at chautomob@gmail.com or +94 71 427 4163", ML, PH - 55);

//       doc.fontSize(7).fillColor(C.lightText)
//         .text("© 2026 CH Automobile. All services come with a satisfaction guarantee. Invoice generated on " + new Date().toLocaleString("en-LK"), ML, PH - 30, {
//           width: CW,
//           align: "center"
//         });

//       doc.end();
//     } catch (err) {
//       reject(err);
//     }
//   });
// };

// module.exports = { generateInvoicePDF };
// utils/invoiceFromHTML.js
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const Customer = require('../models/customerModel');

/**
 * Format currency (PKR)
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculate 3% card fee
 */
function calculateCardProcessingFee(serviceOrder) {
  if (!serviceOrder) return 0;
  const subtotal = serviceOrder.totalAmount || 0;
  return subtotal * 0.03;
}

/**
 * Generate the exact same HTML as the frontend (without React/import)
 */
function generateServiceHistoryHTML(serviceOrder, customerEmail, customerName, customerContactNumber) {
  
  const statusText = serviceOrder.status
    ? serviceOrder.status.charAt(0).toUpperCase() + serviceOrder.status.slice(1)
    : "Completed";

  const otherChargesTotal = (serviceOrder.otherCharges || []).reduce(
    (sum, charge) => sum + (charge.amount || 0),
    0
  );

  // Read logo as base64 (adjust path to your actual logo location)
  let logoSrc = "";
  try {
    const logoPath = path.join(__dirname, "../assets/Logo.png");
    const logoBase64 = fs.readFileSync(logoPath, "base64");
    logoSrc = `data:image/png;base64,${logoBase64}`;
  } catch (err) {
    console.warn("Logo not found, using empty string");
    logoSrc = "";
  }

  return `<!DOCTYPE html>
<html>
   <head>
      <meta charset="UTF-8">
      <style>
         *{
         margin:0;
         padding:0;
         box-sizing:border-box;
         }
         body{
         font-family: 'Inter', 'Roboto', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
         background:#efefef;
         font-weight: 400;
         line-height: 1.5;
         }
         .invoice{
         width:210mm;
         margin:auto;
         background:white;
         color:#222;
         }
         .section{
         padding:24px 36px;
         }
         hr{
         border:none;
         border-top:1px solid #ddd;
         }
         .header{
         display:flex;
         justify-content:space-between;
         align-items:flex-start;
         }
         .logo{
         width:300px;
         margin-left:-50px;
         }
         .company{
         text-align:right;
         line-height:1.8;
         font-size:12px;
         }
         .company-info{
         font-size:12px;
         margin-bottom:8px;
         font-weight:500;
         }
         .top-info{
         display:flex;
         justify-content:space-between;
         margin-top:10px;
         }
         .block{
         width:48%;
         }
         .label{
         font-weight:600;
         margin-bottom:5px;
         font-size:13px;
         }
         .small{
         color:#666;
         line-height:1.7;
         font-size:10px;
         font-weight:500;
         }
         .invoice-meta{
         text-align:right;
         }
         .invoice-meta div{
         margin-bottom:1px;
         }
        .status{
          text-align:right;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:30px;
        }
          .status b{
            font-weight:600;
            text-align:right;
          }
         table{
         width:100%;
         border-collapse:collapse;
         margin-top:20px;
         }
         th{
         text-align:left;
         padding:14px;
         border-bottom:2px solid #ddd;
         font-size:13px;
         font-weight:600;
         }
         td{
         padding:18px 14px;
         border-bottom:1px solid #eee;
         font-size:11px;
         font-weight:500;
         color:#666;
         }
         td:last-child,
         th:last-child{
         text-align:right;
         }
         .section-title {
           font-size: 14px;
           font-weight: 600;
           margin: 20px 0 8px 0;
           letter-spacing: 0.5px;
           color: #1a202c;
         }
         .summary{
         width:320px;
         margin-left:auto;
         margin-top:30px;
         }
         .summary-label{
         font-size:12px;
         font-weight:500;
         color:#666;
        }
         .summary-row{
         display:flex;
         justify-content:space-between;
         padding:5px 0;
         }
         .total{
         font-size:13px;
         font-weight:700;
         }
         .note{
         margin-top:40px;
         line-height:1.8;
         font-size:12px;
         }
         .footer{
         margin-top:50px;
         padding-top:20px;
         border-top:1px solid #ddd;
         display:flex;
         justify-content:space-between;
         align-items:center;
         }
         .bank{
         font-size:12px;
         color:#555;
         }
      </style>
   </head>
   <body>
      <div class="invoice">
         <div class="section">
            <div class="header">
               <div>
                  <img src="${logoSrc}" class="logo"/>
               </div>
               <div class="company">
                  <div class="company-info">
                     304A Abhaya Street<br>
                     Nagoda, Kalutara<br>
                     +94 71 427 4163<br>
                     chautomob@gmail.com
                  </div>
               </div>
            </div>
         </div>
         <hr>
         <div class="section">
            <div class="top-info">
               <div class="block">
                  <div class="label">
                     Bill To:
                  </div>
                  <div class="small">
                     ${customerName}<br>
                     ${customerEmail}<br>
                     ${customerContactNumber}<br>
                     ${serviceOrder.vehicleNumber}
                  </div>
               </div>
               <div class="invoice-meta">
                  <div class="status">
                     <b style="font-size:10px;">Invoice Date</b>
                     <div style="font-size:10px; margin-top:5px; font-weight:500; color:#666;">${formatDate(serviceOrder.createdAt)}</div>
                  </div>
                  <div class="status">
                     <b style="font-size:10px;">Status</b>
                     <div style="font-size:10px; margin-top:5px; font-weight:500; color:#666;">${statusText}</div>
                  </div>
                  <div class="status">
                     <b style="font-size:10px;">Service Type</b>
                     <div style="font-size:10px; margin-top:5px; font-weight:500; color:#666;">${serviceOrder.serviceType || "General Service"}</div>
                  </div>
                    <div class="status">
                     <b style="font-size:10px;">Payment Method</b>
                     <div style="font-size:10px; margin-top:5px; font-weight:500; color:#666;">${serviceOrder.paymentType ? serviceOrder.paymentType === "bank-transfer" ? "Bank Transfer" : serviceOrder.paymentType.charAt(0).toUpperCase() + serviceOrder.paymentType.slice(1) : "N/A"}</div>
                  </div>
               </div>
            </div>

            <!-- PARTS TABLE -->
            <table>
               <thead>
                  <tr>
                     <th>Description</th>
                     <th>Qty</th>
                     <th>Price</th>
                     <th>Amount</th>
                  </tr>
               </thead>
               <tbody>
                  ${(serviceOrder.parts || []).map(p => `
                  <tr>
                      <td>${p.name}</td>
                      <td>${p.quantity}</td>
                      <td>${formatCurrency(p.price)}</td>
                      <td>${formatCurrency((p.quantity||0)*(p.price||0))}</td>
                   </tr>
                  `).join("")}
               </tbody>
            </table>

            <!-- SUMMARY SECTION -->
            <div class="summary">
               <div class="summary-row">
                  <span class="summary-label">Service Charge</span>
                  <span class="summary-label">${formatCurrency(serviceOrder.laborCost||0)}</span>
               </div>
               <div class="summary-row">
                  <span class="summary-label">Materials Charge</span>
                  <span class="summary-label">${formatCurrency(
                  (serviceOrder.parts||[])
                  .reduce((a,p)=> a+(p.price*p.quantity), 0)
                  )}</span>
               </div>

               ${(serviceOrder.otherCharges || []).map(charge => `
               <div class="summary-row">
                  <span class="summary-label">${charge.chargeType || "Other Charge"}</span>
                  <span class="summary-label">${formatCurrency(charge.amount || 0)}</span>
               </div>
               `).join("")}

               ${serviceOrder.paymentType === "card" ? `
               <div class="summary-row">
                  <span class="summary-label">Card Processing Fee (3%)</span>
                  <span class="summary-label">${formatCurrency(calculateCardProcessingFee(serviceOrder))}</span>
               </div>
               ` : ""}

               <div class="summary-row total">
                  <span>Total Amount</span>
                  <span>${formatCurrency(serviceOrder.totalAmount)}</span>
               </div>
            </div>

            <div class="note">
               <b style="font-size:12px; font-weight: 600;">Service Report</b>
               <br>
               <b style="font-size:11px; color:#666; font-weight: 500;">${serviceOrder.serviceDescription || "Vehicle condition good"}</b>
            </div>
            <div class="footer">
               <div class="bank">
                  CH Automobile Service Center
                  <br>
                  Bank Transfer Available
               </div>
            </div>
         </div>
      </div>
   </body>
</html>`;
}

/**
 * Generate PDF using Puppeteer from the same HTML
 * @param {Object} serviceOrder - Service record
 * @returns {Promise<Buffer>} PDF buffer for email attachment
 */
async function generateInvoicePDF(serviceOrder, customerEmail, customerName, customerContactNumber) {
  if (!customerEmail || !customerName || !customerContactNumber) throw new Error(`Customer information is incomplete for service order id: ${serviceOrder._id}`);

  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // for server environments
  });
  const page = await browser.newPage();
  const html = generateServiceHistoryHTML(serviceOrder, customerEmail, customerName, customerContactNumber);
  await page.setContent(html, { waitUntil: 'networkidle0' });
   const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '15px', right: '15px' }
  });
  await browser.close();
   return pdfBuffer;
}

module.exports = { generateInvoicePDF };