import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d5f3a 0%, #093c27 100%)",
          fontFamily: "Sarabun",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "#d4a017",
            color: "#093c27",
            fontSize: 40,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          YP
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#ffffff" }}>{SITE_NAME}</div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 32, color: "#e8ac2e" }}>{SITE_TAGLINE}</div>
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
