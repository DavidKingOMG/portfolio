const HEX_CHARS = '0123456789ABCDEF';
const STATUS_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/ ';

export function createVaultIdHex(byteCount = 2, fillRandomValues = (array) => crypto.getRandomValues(array)) {
  const bytes = new Uint8Array(byteCount);
  fillRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function formatVaultEyebrow(hex) {
  return `VAULT ID: 0x${hex} - VERIFIED // AUTHORIZED`;
}

export function scrambleHex(finalHex, revealRatio, random = Math.random) {
  const safeHex = String(finalHex ?? '').toUpperCase();
  const clampedRatio = Math.max(0, Math.min(revealRatio, 1));
  const revealCount = Math.floor(safeHex.length * clampedRatio);

  return safeHex
    .split('')
    .map((character, index) => {
      if (index < revealCount) {
        return character;
      }

      const randomIndex = Math.floor(random() * HEX_CHARS.length);
      return HEX_CHARS[randomIndex];
    })
    .join('');
}

export function scrambleText(finalText, revealRatio, random = Math.random, charset = STATUS_CHARS) {
  const safeText = String(finalText ?? '').toUpperCase();
  const clampedRatio = Math.max(0, Math.min(revealRatio, 1));
  const revealCount = Math.floor(safeText.length * clampedRatio);

  return safeText
    .split('')
    .map((character, index) => {
      if (character === ' ') {
        return ' ';
      }

      if (index < revealCount) {
        return character;
      }

      const randomIndex = Math.floor(random() * charset.length);
      return charset[randomIndex];
    })
    .join('');
}
