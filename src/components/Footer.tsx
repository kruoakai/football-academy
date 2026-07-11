import Link from "next/link";
import type { SiteSettings } from "@/lib/site-settings";
import { LogoMark } from "@/components/icons";

export default function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="bg-pitch-950 text-white/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-heading text-lg font-semibold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-pitch-950">
                <LogoMark className="h-5 w-5" />
              </span>
              {settings.footerBrandName}
            </div>
            <p className="mt-3 text-sm leading-relaxed">{settings.footerDescription}</p>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-gold-400">
              เมนู
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-gold-300">
                  {settings.navHomeLabel}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold-300">
                  {settings.navAboutLabel}
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-gold-300">
                  {settings.footerCoursesText}
                </Link>
              </li>
              <li>
                <Link href="/clinic" className="hover:text-gold-300">
                  {settings.footerClinicText}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-gold-300">
                  {settings.navGalleryLabel}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-gold-300">
                  {settings.navBlogLabel}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-300">
                  {settings.navContactLabel}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-gold-400">
              ติดต่อเรา
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>{settings.footerAddress}</li>
              <li>โทร: {settings.footerPhone}</li>
              <li>LINE Official: {settings.footerLineId}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-gold-400">
              ติดตามเรา
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="text-white/40">{settings.footerFacebookText}</li>
              <li className="text-white/40">{settings.footerInstagramText}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {settings.footerBrandName} — {settings.footerCopyrightText}
        </div>
      </div>
    </footer>
  );
}
