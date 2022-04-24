// In your own jest-setup.js (or any other name)
import '@testing-library/jest-dom';

// TODO probably move this to __mocks__/uuidv4
let mockUuidCounter = 1;
let mockUuid = jest.fn().mockImplementation(() => {
  return `uuid-${mockUuidCounter++}`;
});

jest.mock('./uuidv4', () => ({
  uuidv4: mockUuid,
}));

beforeEach(() => {
  mockUuidCounter = 1;
});
