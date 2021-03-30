// In your own jest-setup.js (or any other name)
import '@testing-library/jest-dom';

let mockUuidCounter = 1;
let mockUuid = jest.fn().mockImplementation(() => {
  return `uuid-${mockUuidCounter++}`;
});

jest.mock('uuid', () => ({
  v4: () => mockUuid(),
}));

beforeEach(() => {
  mockUuidCounter = 1;
});
