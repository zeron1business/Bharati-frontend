/**
 * Telecom SMS Encoding and Multipart Segment Calculator.
 * Implements 3GPP TS 23.038 (GSM 03.38) standard character sets vs. UCS-2 (Unicode).
 */

const GSM_7_BASIC = new Set([
  // ASCII subset
  " ", "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?", "@",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P",
  "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "_",
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p",
  "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  // Accents and international symbols
  "£", "¥", "è", "é", "ù", "ì", "ò", "Ç", "Ø", "ø", "Å", "å", "Δ", "Φ", "Γ", "Λ",
  "Ω", "Π", "Ψ", "Σ", "Θ", "Ξ", "Æ", "æ", "ß", "É", "¡", "Ä", "Ö", "Ñ", "Ü", "§",
  "¿", "ä", "ö", "ñ", "ü", "à",
  // Whitespace controls
  "\n", "\r"
]);

const GSM_7_EXTENDED = new Set([
  "^", "{", "}", "\\", "[", "~", "]", "|", "€"
]);

export interface SmsAnalysis {
  charCount: number;
  encoding: "GSM-7" | "UCS-2 (Unicode)";
  segments: number;
  remainingInSegment: number;
  maxPerSegment: number;
  isUnicode: boolean;
  hasExtendedGsm: boolean;
}

export function analyzeSms(text: string): SmsAnalysis {
  if (!text || text.length === 0) {
    return {
      charCount: 0,
      encoding: "GSM-7",
      segments: 0,
      remainingInSegment: 160,
      maxPerSegment: 160,
      isUnicode: false,
      hasExtendedGsm: false,
    };
  }

  let isUnicode = false;
  let hasExtendedGsm = false;
  let gsmWeight = 0;

  // Inspect character by character
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (GSM_7_BASIC.has(char)) {
      gsmWeight += 1;
    } else if (GSM_7_EXTENDED.has(char)) {
      hasExtendedGsm = true;
      gsmWeight += 2; // Escape prefix 0x1B + character
    } else {
      isUnicode = true;
      break;
    }
  }

  if (isUnicode) {
    // UCS-2 / UTF-16 code units (surrogate pairs like emojis take 2 code units)
    const length = text.length;
    const maxSingle = 70;
    const maxMulti = 67;
    const segments = length <= maxSingle ? 1 : Math.ceil(length / maxMulti);
    const segmentCapacity = segments === 1 ? maxSingle : segments * maxMulti;
    const remainingInSegment = Math.max(0, segmentCapacity - length);

    return {
      charCount: length,
      encoding: "UCS-2 (Unicode)",
      segments,
      remainingInSegment,
      maxPerSegment: segments === 1 ? maxSingle : maxMulti,
      isUnicode: true,
      hasExtendedGsm: false,
    };
  }

  // Standard GSM-7
  const maxSingle = 160;
  const maxMulti = 153;
  const segments = gsmWeight <= maxSingle ? 1 : Math.ceil(gsmWeight / maxMulti);
  const segmentCapacity = segments === 1 ? maxSingle : segments * maxMulti;
  const remainingInSegment = Math.max(0, segmentCapacity - gsmWeight);

  return {
    charCount: gsmWeight,
    encoding: "GSM-7",
    segments,
    remainingInSegment,
    maxPerSegment: segments === 1 ? maxSingle : maxMulti,
    isUnicode: false,
    hasExtendedGsm,
  };
}

