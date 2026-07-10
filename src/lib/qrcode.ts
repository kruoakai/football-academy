import QRCode from "qrcode";

export async function codeToQrDataUrl(code: string): Promise<string> {
  return QRCode.toDataURL(code, { margin: 1, width: 240 });
}
