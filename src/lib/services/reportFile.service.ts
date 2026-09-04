import PDFDocument from "pdfkit";
import {
  Document,
  Packer,
  Paragraph,
  Table as DocxTable,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  WidthType,
} from "docx";
import ExcelJS from "exceljs";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { getSalesByPeriod, getTopProducts, getPeriodPreset } from "@/lib/services/report.service";
import { listOrders } from "@/lib/services/order.service";
import { listClients } from "@/lib/services/client.service";

export type ReportKind = "summary" | "orders" | "products" | "clients";
export type ReportFormat = "pdf" | "word" | "excel" | "image";

export type ReportTable = {
  title: string;
  columns: string[];
  rows: (string | number)[][];
};

export type ReportData = {
  title: string;
  generatedAt: Date;
  tables: ReportTable[];
};

function money(v: string): string {
  return `$${v}`;
}

export async function buildReportData(kind: ReportKind): Promise<ReportData> {
  const generatedAt = new Date();

  if (kind === "orders") {
    const orders = await listOrders();
    return {
      title: "Reporte de pedidos",
      generatedAt,
      tables: [
        {
          title: "Pedidos",
          columns: ["ID", "Cliente", "Estado", "Tipo", "Total", "Fecha"],
          rows: orders.map((o) => [
            o.id,
            o.clientName || o.clientEmail,
            o.status,
            o.deliveryType,
            money(o.total),
            new Date(o.createdAt).toLocaleString("es-MX"),
          ]),
        },
      ],
    };
  }

  if (kind === "products") {
    const month = getPeriodPreset("mes");
    const top = await getTopProducts(month.from, month.to, 50);
    return {
      title: "Reporte de productos más vendidos (este mes)",
      generatedAt,
      tables: [
        {
          title: "Productos",
          columns: ["Producto", "Cantidad vendida", "Ingresos"],
          rows: top.map((p) => [p.productName, p.quantity, money(p.revenue)]),
        },
      ],
    };
  }

  if (kind === "clients") {
    const clients = await listClients();
    return {
      title: "Reporte de clientes",
      generatedAt,
      tables: [
        {
          title: "Clientes",
          columns: ["Nombre", "Email", "Teléfono", "Bloqueado"],
          rows: clients.map((c) => [
            c.name || "—",
            c.email,
            c.phone || "—",
            c.blocked ? "Sí" : "No",
          ]),
        },
      ],
    };
  }

  // summary (default)
  const today = getPeriodPreset("hoy");
  const month = getPeriodPreset("mes");
  const [salesToday, salesMonth, topProducts, ordersByStatus, clientCount, businessCount] =
    await Promise.all([
      getSalesByPeriod(today.from, today.to),
      getSalesByPeriod(month.from, month.to),
      getTopProducts(month.from, month.to, 10),
      prisma.order.groupBy({ by: ["status"], _count: true }),
      prisma.client.count(),
      prisma.business.count(),
    ]);

  return {
    title: "Resumen del negocio",
    generatedAt,
    tables: [
      {
        title: "Ventas",
        columns: ["Periodo", "Total", "Pedidos", "Ticket promedio"],
        rows: [
          ["Hoy", money(salesToday.totalSales), salesToday.orderCount, money(salesToday.averageTicket)],
          ["Este mes", money(salesMonth.totalSales), salesMonth.orderCount, money(salesMonth.averageTicket)],
        ],
      },
      {
        title: "Pedidos por estado",
        columns: ["Estado", "Cantidad"],
        rows: ordersByStatus.map((s) => [s.status, s._count]),
      },
      {
        title: "Productos más vendidos (este mes)",
        columns: ["Producto", "Cantidad", "Ingresos"],
        rows: topProducts.map((p) => [p.productName, p.quantity, money(p.revenue)]),
      },
      {
        title: "General",
        columns: ["Métrica", "Valor"],
        rows: [
          ["Clientes registrados", clientCount],
          ["Negocios/sucursales", businessCount],
        ],
      },
    ],
  };
}

export async function generatePdf(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).fillColor("#111").text(data.title);
    doc.fontSize(9).fillColor("#666").text(`Generado: ${data.generatedAt.toLocaleString("es-MX")}`);
    doc.moveDown(1);

    const left = doc.page.margins.left;
    const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    for (const table of data.tables) {
      doc.fillColor("#111").fontSize(13).text(table.title);
      doc.moveDown(0.4);

      const colWidth = usableWidth / table.columns.length;

      doc.fontSize(9).fillColor("#111");
      let y = doc.y;
      table.columns.forEach((col, i) => {
        doc.text(col, left + i * colWidth, y, { width: colWidth - 6 });
      });
      y += 16;
      doc.moveTo(left, y - 3).lineTo(left + usableWidth, y - 3).strokeColor("#ddd").stroke();
      doc.y = y;

      doc.fillColor("#333");
      for (const row of table.rows) {
        if (doc.y > doc.page.height - doc.page.margins.bottom - 30) {
          doc.addPage();
          doc.y = doc.page.margins.top;
        }
        const rowY = doc.y;
        row.forEach((cell, i) => {
          doc.text(String(cell), left + i * colWidth, rowY, { width: colWidth - 6 });
        });
        doc.y = rowY + 16;
      }
      doc.moveDown(1);
    }

    doc.end();
  });
}

export async function generateWord(data: ReportData): Promise<Buffer> {
  const children: (Paragraph | DocxTable)[] = [
    new Paragraph({ text: data.title, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: `Generado: ${data.generatedAt.toLocaleString("es-MX")}` }),
  ];

  for (const table of data.tables) {
    children.push(
      new Paragraph({ text: table.title, heading: HeadingLevel.HEADING_2, spacing: { before: 300 } })
    );

    const headerRow = new TableRow({
      children: table.columns.map(
        (c) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: c, bold: true })] })],
          })
      ),
    });
    const dataRows = table.rows.map(
      (row) =>
        new TableRow({
          children: row.map((cell) => new TableCell({ children: [new Paragraph(String(cell))] })),
        })
    );

    children.push(
      new DocxTable({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
      })
    );
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

export async function generateExcel(data: ReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Asistente IA";
  workbook.created = data.generatedAt;

  for (const table of data.tables) {
    const sheetName = table.title.slice(0, 31).replace(/[\\/*?:[\]]/g, "");
    const sheet = workbook.addWorksheet(sheetName || "Datos");
    const headerRow = sheet.addRow(table.columns);
    headerRow.font = { bold: true };
    table.rows.forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((col) => {
      col.width = 24;
    });
  }

  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}

function escapeXml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function generateImage(data: ReportData): Promise<Buffer> {
  const width = 900;
  const rowHeight = 26;
  const table = data.tables[0];
  const rows = table ? table.rows.slice(0, 18) : [];
  const height = 140 + (table ? (rows.length + 1) * rowHeight : 0) + 30;

  let rowsSvg = "";
  if (table) {
    const colWidth = (width - 60) / table.columns.length;
    table.columns.forEach((col, i) => {
      rowsSvg += `<text x="${30 + i * colWidth}" y="128" font-size="13" font-weight="700" fill="#111">${escapeXml(col)}</text>`;
    });
    rowsSvg += `<line x1="30" y1="136" x2="${width - 30}" y2="136" stroke="#ddd" />`;
    rows.forEach((row, r) => {
      const y = 158 + r * rowHeight;
      row.forEach((cell, i) => {
        rowsSvg += `<text x="${30 + i * colWidth}" y="${y}" font-size="12" fill="#333">${escapeXml(cell)}</text>`;
      });
    });
  }

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ffffff" />
  <text x="30" y="45" font-size="22" font-weight="700" fill="#111">${escapeXml(data.title)}</text>
  <text x="30" y="70" font-size="12" fill="#666">Generado: ${escapeXml(data.generatedAt.toLocaleString("es-MX"))}</text>
  ${table ? `<text x="30" y="105" font-size="15" font-weight="700" fill="#111">${escapeXml(table.title)}</text>` : ""}
  ${rowsSvg}
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function generateReportFile(
  kind: ReportKind,
  format: ReportFormat
): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
  const data = await buildReportData(kind);

  if (format === "pdf") {
    return { buffer: await generatePdf(data), contentType: "application/pdf", filename: `${kind}.pdf` };
  }
  if (format === "word") {
    return {
      buffer: await generateWord(data),
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      filename: `${kind}.docx`,
    };
  }
  if (format === "excel") {
    return {
      buffer: await generateExcel(data),
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      filename: `${kind}.xlsx`,
    };
  }
  return { buffer: await generateImage(data), contentType: "image/png", filename: `${kind}.png` };
}
