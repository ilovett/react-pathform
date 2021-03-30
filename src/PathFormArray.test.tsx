import React from 'react';
import { getAllByLabelText, render } from '@testing-library/react';
import { PathFormProvider } from './usePathForm';
import { PathFormArray } from './PathFormArray';
import { PathFormField } from './PathFormField';

const TestWrapper: React.FC = ({ children }) => {
  return <PathFormProvider initialRenderValues={{ items: [{ name: 'Person A' }, { name: 'Person B' }] }}>{children}</PathFormProvider>;
};

describe('PathFormArray', () => {
  let container: HTMLElement;

  beforeEach(() => {
    ({ container } = render(
      <PathFormArray
        path={['items']}
        defaultValue={[]}
        renderItem={({ itemPath, meta }) => {
          return (
            <PathFormField
              path={[...itemPath, 'name']}
              defaultValue=""
              render={({ inputProps, meta, renders }) => (
                <div>
                  <label htmlFor={`name-${meta.uuid}`}>Name</label>
                  <input id={`name-${meta.uuid}`} {...inputProps} />
                  <pre data-testid="meta">{JSON.stringify(meta)}</pre>
                  <pre data-testid="renders">{JSON.stringify(renders)}</pre>
                  <pre data-testid="inputProps">{JSON.stringify(inputProps)}</pre>
                </div>
              )}
            />
          );
        }}
        renderEmpty={() => <>Empty!</>}
      />,
      { wrapper: TestWrapper }
    ));
  });

  it('renders the values from the store', async () => {
    expect(getAllByLabelText(container, 'Name')[0]).toHaveDisplayValue('Person A');
    expect(getAllByLabelText(container, 'Name')[1]).toHaveDisplayValue('Person B');
  });
});
