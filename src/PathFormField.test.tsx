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
        render={(inputProps, meta) => {
          return (
            <div>
              <label htmlFor="name">Name</label>
              <input id="name" {...inputProps} />
              <pre data-testid="meta">{JSON.stringify(meta)}</pre>
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
  });

  it('user can type and modify the value in the store', async () => {
    userEvent.click(getByLabelText(container, 'Name'));
    userEvent.type(getByLabelText(container, 'Name'), ' new text');

    // new text appended
    expect(getByLabelText(container, 'Name')).toHaveDisplayValue(/ new text$/);
  });
});
