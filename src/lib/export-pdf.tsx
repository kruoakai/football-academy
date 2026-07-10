import "server-only";
import path from "path";
import { Document, Page, View, Text, StyleSheet, Font, renderToBuffer } from "@react-pdf/renderer";
import type { ExportColumn } from "./export";

let fontRegistered = false;
function ensureFontRegistered() {
  if (fontRegistered) return;
  Font.register({
    family: "Sarabun",
    fonts: [
      { src: path.join(process.cwd(), "public/fonts/Sarabun-Regular.ttf") },
      { src: path.join(process.cwd(), "public/fonts/Sarabun-Bold.ttf"), fontWeight: "bold" },
    ],
  });
  fontRegistered = true;
}

const styles = StyleSheet.create({
  page: { padding: 28, fontFamily: "Sarabun", fontSize: 9 },
  title: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 9, color: "#556B5D", marginBottom: 14 },
  headerRow: { flexDirection: "row", backgroundColor: "#0D5F3A" },
  row: { flexDirection: "row", borderBottom: "1px solid #DDE3DA" },
  cell: { padding: 5, flexGrow: 1, flexBasis: 0 },
  headerCell: { padding: 5, flexGrow: 1, flexBasis: 0, color: "#FFFFFF", fontWeight: "bold" },
});

function ReportDocument({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
}) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          ยินผัน ฟุตบอล อคาเดมี — ออกรายงานเมื่อ {new Date().toLocaleString("th-TH")}
        </Text>
        <View>
          <View style={styles.headerRow} fixed>
            {columns.map((c) => (
              <Text key={c.key} style={[styles.headerCell, { flexGrow: c.width ?? 1 }]}>
                {c.header}
              </Text>
            ))}
          </View>
          {rows.map((r, i) => (
            <View style={styles.row} key={i} wrap={false}>
              {columns.map((c) => (
                <Text key={c.key} style={[styles.cell, { flexGrow: c.width ?? 1 }]}>
                  {String(r[c.key] ?? "")}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export async function renderReportPdf(
  title: string,
  columns: ExportColumn[],
  rows: Record<string, unknown>[]
): Promise<Buffer> {
  ensureFontRegistered();
  const buf = await renderToBuffer(<ReportDocument title={title} columns={columns} rows={rows} />);
  return Buffer.from(buf);
}
