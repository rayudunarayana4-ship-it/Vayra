import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateOrderInvoicePDF = (order) => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Dark Theme Background
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 297, "F");

    // Header Branding
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("TWO BROTHERS", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(245, 158, 11);
    doc.text("BESPOKE COTTON SHIRTING • ORDER INVOICE", 14, 26);

    // Top Divider
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(0.5);
    doc.line(14, 30, 196, 30);

    // Metadata
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Order ID: ${order.orderNumber || "TB-0000"}`, 14, 38);
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 145, 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(180, 180, 180);
    doc.text(`Customer: ${order.fullName || "Guest"}`, 14, 45);
    doc.text(`WhatsApp: +91 ${order.phone || ""}`, 14, 51);
    if (order.email) doc.text(`Email: ${order.email}`, 14, 57);

    // Detailed Indian Shipping Address Layout
    doc.setFont("helvetica", "bold");
    doc.setTextColor(245, 158, 11);
    doc.text(`Detailed Shipping Address (${order.addressType || "Home"}):`, 105, 45);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 220, 220);
    doc.text(`D.No / House: ${order.houseNo || "-"}`, 105, 51);
    doc.text(`Landmark: ${order.landmark || "-"}`, 105, 56);
    doc.text(`Village/Street: ${order.village || "-"}`, 105, 61);
    doc.text(`Town/City: ${order.town || "-"}, Mandal: ${order.mandal || "-"}`, 105, 66);
    doc.text(`District: ${order.district || "-"}, State: ${order.state || "Andhra Pradesh"}`, 105, 71);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(`PINCODE: ${order.pincode || "-"}`, 105, 76);

    // Table of Ordered Items
    const tableData = (order.items || []).map((item, index) => [
      index + 1,
      item.productName || item.name || "Cotton Shirt",
      item.size || "M",
      item.quantity || 1,
      `INR ${Number(item.price || 0).toLocaleString("en-IN")}`,
      `INR ${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-IN")}`,
    ]);

    autoTable(doc, {
      startY: 84,
      head: [["#", "Garment Specification", "Size", "Qty", "Unit Price", "Total Amount"]],
      body: tableData,
      theme: "plain",
      styles: {
        fillColor: [18, 18, 18],
        textColor: [240, 240, 240],
        fontSize: 8.5,
        cellPadding: 3.5,
      },
      headStyles: {
        fillColor: [30, 30, 30],
        textColor: [245, 158, 11],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [14, 14, 14],
      },
    });

    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 130) + 10;

    // Total Box
    doc.setFillColor(20, 20, 20);
    doc.roundedRect(120, finalY, 76, 22, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(200, 200, 200);
    doc.text("GRAND TOTAL:", 126, finalY + 8);

    doc.setFontSize(13);
    doc.setTextColor(245, 158, 11);
    doc.text(`INR ${Number(order.totalAmount || 0).toLocaleString("en-IN")}`, 126, finalY + 16);

    // Payment Instructions
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Direct QR Payment Protocol:", 14, finalY + 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text("1. Share this order summary with Two Brothers on WhatsApp.", 14, finalY + 36);
    doc.text("2. We verify fabric availability and size specifications.", 14, finalY + 41);
    doc.text("3. We will send our official UPI QR code directly on chat for instant payment.", 14, finalY + 46);
    doc.text("4. Tracking ID will be shared via WhatsApp upon express dispatch.", 14, finalY + 51);

    doc.save(`TwoBrothers_Invoice_${order.orderNumber || "Order"}.pdf`);
  } catch (err) {
    console.error("PDF creation error:", err);
  }
};