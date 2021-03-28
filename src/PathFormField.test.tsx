import React from 'react';
import { getByLabelText, getByTestId, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PathFormProvider } from './usePathForm';
import { PathFormField } from './PathFormField';

const TestWrapper: React.FC = ({ children }) => {
  return (
    <PathFormProvider initialRenderValues={{ nested: { items: [{ name: 'Joey Joe Joe Jr. Shabadoo' }] } }}>{children}</PathFormProvider>
  );
};

describe('PathFormField', () => {
  let container: HTMLElement;

  beforeEach(() => {
    ({ container } = render(
      <PathFormField
        path={['nested', 'items', 0, 'name']}
        defaultValue="default"
        render={({ inputProps, meta, renders }) => {
          return (
            <div>
              <label htmlFor="name">Name</label>
              <input id="name" {...inputProps} />
              <pre data-testid="meta">{JSON.stringify(meta)}</pre>
              <pre data-testid="renders">{JSON.stringify(renders)}</pre>
            </div>
          );
        }}
      />,
      { wrapper: TestWrapper }
    ));
  });

  it('renders with the value from the store', async () => {
    expect(getByTestId(container, 'meta')).toMatchInlineSnapshot(`
      <pre
        data-testid="meta"
      >
        {"uuid":"uuid-4","dirty":false,"touched":false,"error":null}
      </pre>
    `);
    expect(getByLabelText(container, 'Name')).toHaveDisplayValue('Joey Joe Joe Jr. Shabadoo');
    expect(getByTestId(container, 'renders')).toMatchInlineSnapshot(`
      <pre
        data-testid="renders"
      >
        0
      </pre>
    `);
  });

  it('user can type and modify the value in the store', async () => {
    userEvent.click(getByLabelText(container, 'Name'));
    userEvent.type(getByLabelText(container, 'Name'), ' new text');

    // new text appended
    expect(getByLabelText(container, 'Name')).toHaveDisplayValue(/ new text$/);

    // rendered 9 times due to typing 9 characters
    expect(getByTestId(container, 'renders')).toHaveTextContent('9');
  });
});
