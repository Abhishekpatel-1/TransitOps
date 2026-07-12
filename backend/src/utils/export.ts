import PDFDocument from "pdfkit";

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [keys.join(","), ...rows.map((row) => keys.map((key) => escape(row[key])).join(","))].join("\n");
}

export function toPdfBuffer(title: string, rows: Record<string, unknown>[]) {
  return new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ margin: 36, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.fontSize(18).text(title, { underline: true });
    doc.moveDown();
    rows.forEach((row, index) => {
      doc.fontSize(10).text(`${index + 1}. ${JSON.stringify(row)}`);
      doc.moveDown(0.4);
    });
    doc.end();
  });
}
