import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}

// Suppress console.error in tests (can be re-enabled per-test if needed)
jest.spyOn(console, 'error').mockImplementation(() => {});
