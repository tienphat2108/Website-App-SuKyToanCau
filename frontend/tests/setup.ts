import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/**
 * Dọn DOM sau mỗi bài kiểm thử để các thành phần không ảnh hưởng lẫn nhau.
 */
afterEach(() => {
  cleanup();
});
