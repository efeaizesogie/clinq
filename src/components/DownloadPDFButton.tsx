"use client";

import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { ReactNode } from "react";

export const PDF_COLORS = {
  navy: [0, 53, 95] as [number, number, number],
  blue: [15, 76, 129] as [number, number, number],
  light: [239, 244, 255] as [number, number, number],
  border: [194, 199, 209] as [number, number, number],
  text: [66, 71, 79] as [number, number, number],
  dark: [13, 28, 46] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  green: [21, 128, 61] as [number, number, number],
  red: [186, 26, 26] as [number, number, number],
  amber: [180, 83, 9] as [number, number, number],
};

/** Call this to draw the standard Clinq header banner. Returns the y position after the header. */
export function drawPDFHeader(doc: jsPDF, subtitle: string): number {
  const W = 210;
  const margin = 18;

  doc.setFillColor(...PDF_COLORS.navy);
  doc.rect(0, 0, W, 42, "F");

  doc.setTextColor(...PDF_COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Clinq", margin, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(217, 230, 248);
  doc.text(subtitle, margin, 28);

  const genDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  doc.setFontSize(8);
  doc.text(`Generated: ${genDate}`, W - margin, 28, { align: "right" });

  doc.setFillColor(...PDF_COLORS.blue);
  doc.rect(0, 42, W, 3, "F");

  return 56;
}

/** Draw the standard Clinq footer on every page. */
export function drawPDFFooter(doc: jsPDF) {
  const W = 210;
  const margin = 18;
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(...PDF_COLORS.navy);
    doc.rect(0, 287, W, 10, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...PDF_COLORS.white);
    doc.text("Clinq Medical — Confidential Patient Record", margin, 293);
    doc.text(`Page ${p} of ${pageCount}`, W - margin, 293, { align: "right" });
  }
}

interface Props {
  /** File name without extension */
  filename: string;
  /** Receives a fresh jsPDF doc. Draw your content, then return — footer is added automatically. */
  buildDoc: (doc: jsPDF) => void;
  /** Button label */
  label?: string;
  /** Optional custom class overrides */
  className?: string;
  /** Render as icon-only button (no label) */
  iconOnly?: boolean;
  children?: ReactNode;
}

export default function DownloadPDFButton({
  filename,
  buildDoc,
  label = "Download PDF",
  className,
  iconOnly = false,
}: Props) {
  function handleClick() {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    buildDoc(doc);
    drawPDFFooter(doc);
    doc.save(`${filename}.pdf`);
  }

  if (iconOnly) {
    return (
      <button
        onClick={handleClick}
        className={className ?? "p-2 rounded-[12px] hover:bg-[#EFF4FF] transition-colors"}
        title={label}
      >
        <Download className="w-4 h-4 text-[#00355F]" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={
        className ??
        "flex items-center gap-3 px-6 py-3 bg-[#00355F] rounded-[8px] text-white shrink-0 hover:bg-[#002645] transition-colors"
      }
    >
      <Download className="w-4 h-4 shrink-0" />
      <span className="text-[12px] font-[600] leading-4 tracking-[0.6px] uppercase whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}
