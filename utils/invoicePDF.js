const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoicePDF = async (serviceRecord, customer, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 0 });

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);

      // ─────────────────────────────────────────
      // REGISTER FONTS
      // ─────────────────────────────────────────
      const fontDir = path.join(__dirname, "../assets/fonts");
      doc.registerFont("Poppins", path.join(fontDir, "Poppins-Regular.ttf"));

      // ─────────────────────────────────────────
      // COLORS & STYLING
      // ─────────────────────────────────────────
      const C = {
        primary: "#126799",
        primaryLight: "#0c3577",
        accent: "#c8ddfc",
        text: "#1f2937",
        subText: "#6b7280",
        lightText: "#9ca3af",
        border: "#e5e7eb",
        bgLight: "#f9fafb",
        bgLighter: "#f3f4f6",
        white: "#ffffff",
        success: "#10b981"
      };

      // ─────────────────────────────────────────
      // LAYOUT
      // ─────────────────────────────────────────
      const PW = 595.28;
      const PH = 841.89;
      const ML = 45;
      const MR = 45;
      const CW = PW - ML - MR;

      let y = 0;

      // ─────────────────────────────────────────
      // FORMATTERS
      // ─────────────────────────────────────────
      const fmt = (n) =>
        new Intl.NumberFormat("en-LK", {
          style: "currency",
          currency: "LKR",
        }).format(n || 0);

      const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

      // ─────────────────────────────────────────
      // TOP ACCENT BANNER
      // ─────────────────────────────────────────
      doc.rect(0, 0, PW, 8).fill(C.primary);
      y = 8;

      // ─────────────────────────────────────────
      // HEADER WITH LOGO & COMPANY INFO
      // ─────────────────────────────────────────
      y += 20;
      const logoPath = path.join(__dirname, "../assets/Logo.png");
      const logoSize = 220;

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, ML, y, {
          fit: [logoSize, logoSize],
        });
      }

      // Invoice Badge on Right
      doc.rect(PW - MR - 140, y, 140, 88).fill(C.bgLighter);
      doc.rect(PW - MR - 140, y, 140, 5).fill(C.primary);

    //   const invoiceNumber = serviceRecord._id
    //     ? serviceRecord._id.toString().slice(-6)
    //     : "000001";
    // Generate a random 6-digit invoice number for demonstration purposes
    const invoiceNumber = Math.floor(Math.random() * 1000000);

      doc.fontSize(10).fillColor(C.subText).font("Poppins")
        .text("INVOICE", PW - MR - 135, y + 8);

      doc.fontSize(10).fillColor(C.primary).font("Poppins")
        .text(`#${invoiceNumber}`, PW - MR - 135, y + 22);

      doc.fontSize(8).fillColor(C.lightText)
        .text(`Issued: ${formatDate(serviceRecord.createdAt)}`, PW - MR - 135, y + 38)
        .text(`Status: Completed`, PW - MR - 135, y + 50)
        .text(`Payment Amount: ${fmt(serviceRecord.laborCost + (serviceRecord.parts || []).reduce((sum, p) => sum + (p.price * p.quantity), 0))}`, PW - MR - 135, y + 62);

      y += 110;

      // ─────────────────────────────────────────
      // DIVIDER
      // ─────────────────────────────────────────
      doc.moveTo(ML, y).lineTo(PW - MR, y).stroke(C.border);
      y += 20;

      // ─────────────────────────────────────────
      // BILL TO & SERVICE DETAILS (2 COLUMNS)
      // ─────────────────────────────────────────
      const col1X = ML;
      const col2X = ML + CW / 2 + 15;

      // Bill To
      doc.fontSize(10).fillColor(C.primary).font("Poppins")
        .text("BILL TO", col1X, y);

      doc.fontSize(12).fillColor(C.text).font("Poppins")
        .text(customer.name || "N/A", col1X, y + 18);

      doc.fontSize(9).fillColor(C.subText)
        .text(customer.email || "N/A", col1X, y + 38)
        .text(customer.contactNumber || "N/A", col1X, y + 52)
        .text("Vehicle Owner", col1X, y + 70);

      // Service Details
      doc.fontSize(10).fillColor(C.primary).font("Poppins")
        .text("SERVICE DETAILS", col2X, y);

      doc.fontSize(9).fillColor(C.subText)
        .text("Vehicle Number:", col2X, y + 18);
      doc.fontSize(10).fillColor(C.text).font("Poppins")
        .text(serviceRecord.vehicleNumber || "-", col2X, y + 30);

      doc.fontSize(9).fillColor(C.subText)
        .text("Service Type:", col2X, y + 48);
      doc.fontSize(10).fillColor(C.text).font("Poppins")
        .text(serviceRecord.serviceDescription || "-", col2X, y + 60);

      y += 90;

      // ─────────────────────────────────────────
      // DIVIDER
      // ─────────────────────────────────────────
      doc.moveTo(ML, y).lineTo(PW - MR, y).stroke(C.border);
      y += 15;

      // ─────────────────────────────────────────
      // ITEMS TABLE
      // ─────────────────────────────────────────
      const tableY = y;
      const colDescX = ML;
      const colQtyX = ML + 260;
      const colPriceX = ML + 320;
      const colTotalX = ML + 400;

      // Header
      doc.rect(ML, tableY, CW, 32).fill(C.primary);

      doc.fontSize(11).fillColor(C.white).font("Poppins")
        .text("Description", colDescX + 12, tableY + 10)
        .text("Qty", colQtyX + 8, tableY + 10)
        .text("Unit Price", colPriceX + 5, tableY + 10)
        .text("Total", colTotalX + 15, tableY + 10);

      y = tableY + 32;

      // ─────────────────────────────────────────
      // TABLE ROWS
      // ─────────────────────────────────────────
      let partsSubtotal = 0;
      const parts = serviceRecord.parts || [];

      if (parts.length === 0) {
        doc.rect(ML, y, CW, 30).fill(C.bgLighter);
        doc.fontSize(10).fillColor(C.subText)
          .text("No items in this service record", colDescX + 12, y + 10);
        y += 30;
      } else {
        parts.forEach((p, i) => {
          const total = (p.price || 0) * (p.quantity || 0);
          partsSubtotal += total;

          const rowBg = i % 2 === 0 ? C.bgLight : C.white;
          doc.rect(ML, y, CW, 30).fill(rowBg);

          doc.fontSize(10).fillColor(C.text)
            .text(p.name || "-", colDescX + 12, y + 8)
            .text((p.quantity || 0).toString(), colQtyX + 8, y + 8)
            .text(fmt(p.price || 0), colPriceX + 5, y + 8)
            .text(fmt(total), colTotalX + 15, y + 8);

          y += 30;
        });
      }

      y += 10;

      // ─────────────────────────────────────────
      // DIVIDER
      // ─────────────────────────────────────────
      doc.moveTo(ML, y).lineTo(PW - MR, y).stroke(C.border);
      y += 15;

      // ─────────────────────────────────────────
      // SUMMARY BOX
      // ─────────────────────────────────────────
      const laborCost = serviceRecord.laborCost || 0;
      const totalAmount = partsSubtotal + laborCost;

      const summaryX = PW - MR - 180;
      const summaryY = y;

      // Container
      doc.rect(summaryX, summaryY, 180, 90).fill(C.bgLighter);
      doc.rect(summaryX, summaryY, 180, 4).fill(C.primaryLight);

      // Subtotal
      doc.fontSize(9).fillColor(C.subText).font("Poppins")
        .text("Subtotal:", summaryX + 12, summaryY + 12);
      doc.fontSize(10).fillColor(C.text).font("Poppins")
        .text(fmt(partsSubtotal), summaryX + 12, summaryY + 12, {
          width: 156,
          align: "right"
        });

      // Labor
      doc.fontSize(9).fillColor(C.subText)
        .text("Labor Cost:", summaryX + 12, summaryY + 30);
      doc.fontSize(10).fillColor(C.text).font("Poppins")
        .text(fmt(laborCost), summaryX + 12, summaryY + 30, {
          width: 156,
          align: "right"
        });

      // Line
      doc.moveTo(summaryX + 12, summaryY + 50).lineTo(summaryX + 168, summaryY + 50)
        .stroke(C.border);

      // Total
      doc.fontSize(11).fillColor(C.primary).font("Poppins")
        .text("TOTAL:", summaryX + 12, summaryY + 60);
      doc.fontSize(14).fillColor(C.primary).font("Poppins")
        .text(fmt(totalAmount), summaryX + 12, summaryY + 60, {
          width: 156,
          align: "right"
        });

      // ─────────────────────────────────────────
      // FOOTER SECTION
      // ─────────────────────────────────────────
      doc.moveTo(ML, PH - 80).lineTo(PW - MR, PH - 80).stroke(C.border);

      doc.fontSize(10).fillColor(C.text).font("Poppins")
        .text("Thank you for your business!", ML, PH - 70);

      doc.fontSize(8).fillColor(C.subText)
        .text("We appreciate your trust. For any queries, contact us at chautomob@gmail.com or +94 71 427 4163", ML, PH - 55);

      doc.fontSize(7).fillColor(C.lightText)
        .text("© 2026 CH Automobile. All services come with a satisfaction guarantee. Invoice generated on " + new Date().toLocaleString("en-LK"), ML, PH - 30, {
          width: CW,
          align: "center"
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateInvoicePDF };