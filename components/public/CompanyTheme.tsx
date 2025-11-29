"use client";

import { useEffect, useId } from "react";

interface CompanyThemeProps {
  primaryColor?: string;
  secondaryColor?: string;
}

// Helper to convert hex to {r,g,b}
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) return null;
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Convert RGB to OKLCH
function rgbToOklch(r: number, g: number, b: number) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = toLinear(rNorm);
  const lg = toLinear(gNorm);
  const lb = toLinear(bNorm);

  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb;
  const z = 0.0193339 * lr + 0.119192 * lg + 0.9503041 * lb;

  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + bVal * bVal);
  let H = (Math.atan2(bVal, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

function oklch(l: number, c: number, h: number) {
  return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)})`;
}

function needsLightForeground(r: number, g: number, b: number) {
  const toLinear = (c: number) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance < 0.5;
}

function generateThemeCSS(
  primaryColor: string,
  secondaryColor?: string
): string | null {
  const rgb = hexToRgb(primaryColor);
  if (!rgb) return null;

  const { l, c, h } = rgbToOklch(rgb.r, rgb.g, rgb.b);
  const isLight = !needsLightForeground(rgb.r, rgb.g, rgb.b);

  // Secondary color
  let secL = 0.92,
    secC = 0.02,
    secH = 0;
  let secFgL = 0.4;
  if (secondaryColor) {
    const secRgb = hexToRgb(secondaryColor);
    if (secRgb) {
      const sec = rgbToOklch(secRgb.r, secRgb.g, secRgb.b);
      secL = sec.l;
      secC = sec.c;
      secH = sec.h;
      secFgL = needsLightForeground(secRgb.r, secRgb.g, secRgb.b) ? 0.98 : 0.15;
    }
  }

  return `
:root {
  --primary: ${oklch(l, c, h)};
  --primary-foreground: ${isLight ? "oklch(0.15 0 0)" : "oklch(0.98 0 0)"};
  --color-primary: ${oklch(l, c, h)};
  --color-primary-foreground: ${
    isLight ? "oklch(0.15 0 0)" : "oklch(0.98 0 0)"
  };
  
  --secondary: ${oklch(secL, secC, secH)};
  --secondary-foreground: oklch(${secFgL} 0 0);
  --color-secondary: ${oklch(secL, secC, secH)};
  --color-secondary-foreground: oklch(${secFgL} 0 0);
  
  --ring: ${oklch(l, c, h)};
  --color-ring: ${oklch(l, c, h)};
}
`;
}

export function CompanyTheme({
  primaryColor,
  secondaryColor,
}: CompanyThemeProps) {
  const styleId = useId();

  useEffect(() => {
    if (!primaryColor) return;

    const css = generateThemeCSS(primaryColor, secondaryColor);
    if (!css) return;

    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;

    return () => {
      styleEl?.remove();
    };
  }, [primaryColor, secondaryColor, styleId]);

  return null;
}
