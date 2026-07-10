import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/site";

export const alt = "บทความ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.article.findFirst({ where: { slug, published: true } });
  const title = article?.title ?? SITE_NAME;

  const [sarabunRegular, sarabunBold] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/Sarabun-Regular.ttf")),
    readFile(join(process.cwd(), "public/fonts/Sarabun-Bold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background: "linear-gradient(135deg, #0d5f3a 0%, #093c27 100%)",
          fontFamily: "Sarabun",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "#d4a017",
            color: "#093c27",
            fontSize: 26,
            fontWeight: 700,
            marginBottom: 28,
          }}
        >
          YP
        </div>
        <div style={{ display: "flex", fontSize: 52, fontWeight: 700, color: "#ffffff", lineHeight: 1.3 }}>
          {title}
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 24, color: "#e8ac2e" }}>{SITE_NAME}</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Sarabun", data: sarabunRegular, style: "normal", weight: 400 },
        { name: "Sarabun", data: sarabunBold, style: "normal", weight: 700 },
      ],
    }
  );
}
