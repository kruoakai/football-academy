import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-pitch-950 text-white/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-heading text-lg font-semibold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-pitch-950 text-sm font-bold">
                YP
              </span>
              ยินผัน ฟุตบอล อคาเดมี
            </div>
            <p className="mt-3 text-sm leading-relaxed">
              สอนโดยทีมชาติ ฟื้นฟูโดยมืออาชีพ — สถาบันฟุตบอลที่ผสานการฝึกซ้อมและการดูแลร่างกายไว้ในที่เดียว
            </p>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-gold-400">
              เมนู
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-gold-300">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold-300">
                  เกี่ยวกับเรา
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-gold-300">
                  บทความ
                </Link>
              </li>
              <li className="text-white/40">คอร์สเรียน (เร็วๆ นี้)</li>
              <li className="text-white/40">คลินิกกายภาพ (เร็วๆ นี้)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-gold-400">
              ติดต่อเรา
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>สนามฝึกซ้อม ยินผัน ฟุตบอล อคาเดมี</li>
              <li>โทร: 0XX-XXX-XXXX</li>
              <li>LINE Official: @yinphanacademy</li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-gold-400">
              ติดตามเรา
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="text-white/40">Facebook (เร็วๆ นี้)</li>
              <li className="text-white/40">Instagram (เร็วๆ นี้)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} ยินผัน ฟุตบอล อคาเดมี — สงวนลิขสิทธิ์
        </div>
      </div>
    </footer>
  );
}
