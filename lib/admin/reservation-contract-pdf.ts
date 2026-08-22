import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { reservationConfig } from "@/config/reservations";
import { siteConfig } from "@/config/site";
import type { ReservationContractData } from "@/lib/admin/reservation-contract";
import { formatPlanPrice } from "@/lib/format/price";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 48;
const HEADER_HEIGHT = 78;
const PAGE_BOTTOM = 40;
const SIGNATURE_BLOCK = 78;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const ink = rgb(0.1, 0.1, 0.1);
const muted = rgb(0.38, 0.38, 0.38);
const line = rgb(0.82, 0.82, 0.82);
const headerBg = rgb(0, 0, 0);
const headerFg = rgb(1, 1, 1);

function formatPlain(value: string | null | undefined) {
  const text = value?.trim();
  return text ? text : "—";
}

function formatMoney(value: number | null | undefined) {
  if (value == null) return "—";
  return formatPlanPrice(value) ?? String(value);
}

function formatGuestCount(value: number | null | undefined) {
  if (value == null) return "—";
  return `${value.toLocaleString("es-CO")} ${siteConfig.portfolio.planGuestSuffix}`;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  if (words.length === 0) return lines;

  let current = words[0] ?? "";
  for (const word of words.slice(1)) {
    const next = `${current} ${word}`;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);
  return lines;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getReservationContractFileName(data: ReservationContractData) {
  const client = slugify(data.clientName) || "cliente";
  return `${reservationConfig.contract.fileNamePrefix}-${client}.pdf`;
}

async function loadLogoBytes() {
  const response = await fetch(siteConfig.logo.main);
  if (!response.ok) return null;
  return new Uint8Array(await response.arrayBuffer());
}

class ContractPdfWriter {
  private readonly page: PDFPage;
  private y: number;
  private logoImage: Awaited<ReturnType<PDFDocument["embedPng"]>> | null = null;

  constructor(
    private readonly regular: PDFFont,
    private readonly bold: PDFFont,
    private readonly doc: PDFDocument,
  ) {
    this.page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT;
  }

  async embedLogo(bytes: Uint8Array | null) {
    if (!bytes) return;
    this.logoImage = await this.doc.embedPng(bytes);
  }

  private contentFloor() {
    return PAGE_BOTTOM + SIGNATURE_BLOCK + 16;
  }

  hasSpace(needed: number) {
    return this.y - needed >= this.contentFloor();
  }

  drawHeader() {
    this.page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - HEADER_HEIGHT,
      width: PAGE_WIDTH,
      height: HEADER_HEIGHT,
      color: headerBg,
    });

    const logoSize = 50;
    const logoY = PAGE_HEIGHT - HEADER_HEIGHT + (HEADER_HEIGHT - logoSize) / 2;

    if (this.logoImage) {
      this.page.drawImage(this.logoImage, {
        x: MARGIN_X,
        y: logoY,
        width: logoSize,
        height: logoSize,
      });
    }

    const textX = this.logoImage ? MARGIN_X + logoSize + 14 : MARGIN_X;
    this.page.drawText(siteConfig.name, {
      x: textX,
      y: PAGE_HEIGHT - 36,
      size: 16,
      font: this.bold,
      color: headerFg,
    });
    this.page.drawText(siteConfig.hero.tagline, {
      x: textX,
      y: PAGE_HEIGHT - 54,
      size: 8,
      font: this.regular,
      color: rgb(0.75, 0.75, 0.75),
    });

    this.y = PAGE_HEIGHT - HEADER_HEIGHT - 22;
  }

  addTitle(text: string) {
    this.page.drawText(text.toUpperCase(), {
      x: MARGIN_X,
      y: this.y,
      size: 16,
      font: this.bold,
      color: ink,
    });
    this.y -= 20;
  }

  addMeta(text: string) {
    this.page.drawText(text, {
      x: MARGIN_X,
      y: this.y,
      size: 10,
      font: this.regular,
      color: muted,
    });
    this.y -= 16;
  }

  addParagraph(text: string, size = 11, maxLines = 5) {
    const lineHeight = size + 5;
    const lines = wrapText(text, this.regular, size, CONTENT_WIDTH).slice(0, maxLines);
    if (!this.hasSpace(lines.length * lineHeight + 6)) return;

    for (const item of lines) {
      this.page.drawText(item, {
        x: MARGIN_X,
        y: this.y,
        size,
        font: this.regular,
        color: ink,
      });
      this.y -= lineHeight;
    }
    this.y -= 8;
  }

  addSectionTitle(text: string) {
    if (!this.hasSpace(30)) return;
    this.y -= 10;
    this.page.drawText(text.toUpperCase(), {
      x: MARGIN_X,
      y: this.y,
      size: 11,
      font: this.bold,
      color: ink,
    });
    this.y -= 7;
    this.page.drawLine({
      start: { x: MARGIN_X, y: this.y },
      end: { x: PAGE_WIDTH - MARGIN_X, y: this.y },
      thickness: 0.6,
      color: line,
    });
    this.y -= 16;
  }

  addKeyValue(label: string, value: string) {
    const size = 11;
    const labelWidth = 122;
    const lines = wrapText(value, this.regular, size, CONTENT_WIDTH - labelWidth);
    const lineHeight = 16;
    if (!this.hasSpace(lines.length * lineHeight + 4)) return;

    this.page.drawText(`${label}:`, {
      x: MARGIN_X,
      y: this.y,
      size,
      font: this.bold,
      color: ink,
    });

    lines.forEach((item, index) => {
      this.page.drawText(item, {
        x: MARGIN_X + labelWidth,
        y: this.y,
        size,
        font: this.regular,
        color: ink,
      });
      if (index < lines.length - 1) this.y -= lineHeight;
    });
    this.y -= 18;
  }

  addTwoColumns(
    leftTitle: string,
    leftLines: string[],
    rightTitle: string,
    rightLines: string[],
  ) {
    const colWidth = (CONTENT_WIDTH - 16) / 2;
    const rowHeight = 15;
    const boxPad = 12;
    const titleH = 18;
    const boxH = titleH + Math.max(leftLines.length, rightLines.length) * rowHeight + boxPad * 2;
    if (!this.hasSpace(boxH + 12)) return;

    const boxY = this.y - boxH;
    this.page.drawRectangle({
      x: MARGIN_X,
      y: boxY,
      width: colWidth,
      height: boxH,
      borderColor: line,
      borderWidth: 0.8,
    });
    this.page.drawRectangle({
      x: MARGIN_X + colWidth + 16,
      y: boxY,
      width: colWidth,
      height: boxH,
      borderColor: line,
      borderWidth: 0.8,
    });

    const drawCol = (x: number, title: string, lines: string[]) => {
      let cursor = this.y - boxPad - 10;
      this.page.drawText(title.toUpperCase(), {
        x: x + boxPad,
        y: cursor,
        size: 8,
        font: this.bold,
        color: muted,
      });
      cursor -= titleH;
      for (const item of lines) {
        this.page.drawText(item, {
          x: x + boxPad,
          y: cursor,
          size: 10,
          font: this.regular,
          color: ink,
        });
        cursor -= rowHeight;
      }
    };

    drawCol(MARGIN_X, leftTitle, leftLines);
    drawCol(MARGIN_X + colWidth + 16, rightTitle, rightLines);
    this.y = boxY - 14;
  }

  addNumberedList(items: readonly string[]) {
    const size = 9;
    const numberWidth = 16;
    const lineHeight = 13;

    for (const [index, item] of items.entries()) {
      const lines = wrapText(item, this.regular, size, CONTENT_WIDTH - numberWidth);
      this.page.drawText(`${index + 1}.`, {
        x: MARGIN_X,
        y: this.y,
        size,
        font: this.bold,
        color: ink,
      });
      for (const lineText of lines) {
        this.page.drawText(lineText, {
          x: MARGIN_X + numberWidth,
          y: this.y,
          size,
          font: this.regular,
          color: ink,
        });
        this.y -= lineHeight;
      }
      this.y -= 4;
    }
  }

  addSignatures(providerName: string, clientName: string) {
    const { contract } = reservationConfig;
    const colWidth = (CONTENT_WIDTH - 40) / 2;
    const leftX = MARGIN_X;
    const rightX = MARGIN_X + colWidth + 40;
    const gap = 28;
    const namesOffset = 28;

    let lineY = this.y - gap - 18;
    if (lineY - namesOffset < PAGE_BOTTOM) {
      lineY = PAGE_BOTTOM + namesOffset;
    }

    this.page.drawText(contract.signatureLineLabel, {
      x: leftX,
      y: lineY + 12,
      size: 9,
      font: this.regular,
      color: muted,
    });
    this.page.drawText(contract.signatureLineLabel, {
      x: rightX,
      y: lineY + 12,
      size: 9,
      font: this.regular,
      color: muted,
    });

    this.page.drawLine({
      start: { x: leftX, y: lineY },
      end: { x: leftX + colWidth, y: lineY },
      thickness: 0.9,
      color: ink,
    });
    this.page.drawLine({
      start: { x: rightX, y: lineY },
      end: { x: rightX + colWidth, y: lineY },
      thickness: 0.9,
      color: ink,
    });

    this.page.drawText(providerName, {
      x: leftX,
      y: lineY - 16,
      size: 11,
      font: this.bold,
      color: ink,
    });
    this.page.drawText(contract.signatureProviderRole, {
      x: leftX,
      y: lineY - 30,
      size: 9,
      font: this.regular,
      color: muted,
    });

    this.page.drawText(clientName, {
      x: rightX,
      y: lineY - 16,
      size: 11,
      font: this.bold,
      color: ink,
    });
    this.page.drawText(contract.signatureClientRole, {
      x: rightX,
      y: lineY - 30,
      size: 9,
      font: this.regular,
      color: muted,
    });
  }

  save() {
    return this.doc.save();
  }
}

export async function downloadReservationContractPdf(data: ReservationContractData) {
  const { contract } = reservationConfig;
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const writer = new ContractPdfWriter(regular, bold, doc);

  await writer.embedLogo(await loadLogoBytes());
  writer.drawHeader();
  writer.addTitle(contract.documentTitle);
  writer.addMeta(`${siteConfig.name} · ${data.issuedAtLabel}`);
  writer.addParagraph(contract.intro, 11, 4);

  writer.addTwoColumns(
    contract.providerLabel,
    [
      siteConfig.name,
      siteConfig.contact.email,
      siteConfig.contact.phone,
      siteConfig.contact.city,
    ],
    contract.clientLabel,
    [
      data.clientName,
      `Cédula: ${formatPlain(data.clientIdNumber)}`,
      `Teléfono: ${formatPlain(data.clientPhone)}`,
      `Correo: ${formatPlain(data.clientEmail)}`,
    ],
  );

  writer.addSectionTitle(contract.eventLabel);
  writer.addKeyValue("Fecha", formatPlain(data.eventDateLabel));
  writer.addKeyValue("Lugar", formatPlain(data.location));
  writer.addKeyValue("Personas", formatGuestCount(data.guestCount));

  writer.addSectionTitle(contract.serviceLabel);
  writer.addKeyValue(
    "Plan",
    data.categoryTitle && data.planTitle
      ? `${data.categoryTitle} · ${data.planTitle}`
      : formatPlain(data.planTitle),
  );
  if (data.planDescription) {
    writer.addParagraph(stripHtml(data.planDescription), 11, 5);
  } else if (data.planTagline) {
    writer.addParagraph(data.planTagline, 11, 2);
  }

  const includedSections = data.planSections
    .map((section) => section.title.trim())
    .filter(Boolean);
  if (includedSections.length > 0) {
    writer.addKeyValue("Incluye", includedSections.join(" · "));
  }

  writer.addSectionTitle(contract.financialLabel);
  writer.addKeyValue("Valor del plan", formatMoney(data.planPrice));
  writer.addKeyValue("Abono recibido", formatMoney(data.amountPaid));
  writer.addKeyValue("Saldo pendiente", formatMoney(data.amountRemaining));
  if (data.notes) {
    writer.addKeyValue("Notas", stripHtml(data.notes));
  }

  writer.addSectionTitle(contract.clausesTitle);
  writer.addNumberedList(contract.clauses);

  writer.addSignatures(contract.signatureProviderName, data.clientName);

  const bytes = await writer.save();
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = getReservationContractFileName(data);
  anchor.click();
  URL.revokeObjectURL(url);
}
