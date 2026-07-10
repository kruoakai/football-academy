import type { Metadata } from "next";
import { Kanit, Sarabun } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings";
import "./globals.css";

// Header/Footer text comes from the DB (SiteSettings singleton). Revalidate
// periodically rather than forcing every route dynamic, so pages that don't
// need live data (e.g. /about, /login) keep their static-generation speed —
// admin edits to the header/footer still show up within ~1 minute.
export const revalidate = 60;

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["500", "600", "700"],
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description:
    "สถาบันฟุตบอลยินผัน อคาเดมี สอนฟุตบอลโดยอดีตนักเตะทีมชาติไทย ผสานการฟื้นฟู/กายภาพบำบัดโดยมืออาชีพ ในที่เดียว",
  openGraph: {
    siteName: SITE_NAME,
    locale: "th_TH",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="th"
      className={`${kanit.variable} ${sarabun.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <Header settings={settings} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
