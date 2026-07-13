import "server-only";
import generatePayload from "promptpay-qr";
import { codeToQrDataUrl } from "@/lib/qrcode";

// target: a mobile number ("08XXXXXXXX") or 13-digit Thai citizen/tax ID.
// amount omitted => static QR (no fixed amount, customer types it manually);
// amount given => dynamic QR pre-filled with that amount in the banking app.
export async function promptpayQrDataUrl(target: string, amount?: number): Promise<string> {
  const payload = generatePayload(target, { amount });
  return codeToQrDataUrl(payload);
}
