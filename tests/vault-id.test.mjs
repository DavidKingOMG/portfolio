import test from 'node:test';
import assert from 'node:assert/strict';

import { createVaultIdHex, formatVaultEyebrow, scrambleHex, scrambleText } from '../assets/js/vault-id.mjs';

test('createVaultIdHex returns uppercase hex with requested byte length', () => {
  const hex = createVaultIdHex(2, (bytes) => {
    bytes[0] = 0xab;
    bytes[1] = 0x1f;
    return bytes;
  });

  assert.equal(hex, 'AB1F');
});

test('formatVaultEyebrow formats the final verified string', () => {
  assert.equal(
    formatVaultEyebrow('AB1F'),
    'VAULT ID: 0xAB1F - VERIFIED // AUTHORIZED'
  );
});

test('scrambleHex reveals more of the final hex as progress increases', () => {
  const finalHex = 'AB1F';
  const random = () => 0;

  assert.equal(scrambleHex(finalHex, 0, random), '0000');
  assert.equal(scrambleHex(finalHex, 0.5, random), 'AB00');
  assert.equal(scrambleHex(finalHex, 1, random), 'AB1F');
});

test('scrambleText preserves spaces and reveals the final text over time', () => {
  const finalText = 'VERIFIED // AUTHORIZED';
  const random = () => 0;

  assert.equal(scrambleText(finalText, 0, random), 'AAAAAAAA AA AAAAAAAAAA');
  assert.equal(scrambleText(finalText, 1, random), finalText);
});
