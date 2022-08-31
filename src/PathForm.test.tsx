import React, { ReactNode } from 'react';
import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PathFormProvider } from '.';
import { PathFormField } from './PathFormField';
import { PathForm, PathFormArray, usePathForm, usePathFormDirtyUuids } from '.';

const initialRenderValues = {
  firstName: 'Joey Joe Joe Jr.',
  lastName: 'Sabadoo',
  friends: [{ firstName: 'Homer' }, { firstName: 'Barney' }],
};

function TestWrapper({ children }: { children?: ReactNode }) {
  return (
    <PathFormProvider initialRenderValues={initialRenderValues}>
      {children}
      <FormActions />
      <DirtyFields />
    </PathFormProvider>
  );
}

function FormActions() {
  const { reset, array } = usePathForm();
  return (
    <div>
      <button onClick={() => reset()}>Reset</button>
      <button onClick={() => reset({ defaultValues: { firstName: '', lastName: '', friends: [] } })}>Clear All</button>
      <button onClick={() => array.append(['friends'], { firstName: '' })}>Add Friend</button>
    </div>
  );
}

function DirtyFields() {
  const dirty = usePathFormDirtyUuids();
  return (
    <>
      <div data-testid="dirtyUuids">{JSON.stringify(dirty)}</div>
    </>
  );
}

describe('PathForm', () => {
  let view: RenderResult;

  beforeEach(() => {
    view = render(
      <>
        <PathFormField
          path={['firstName']}
          defaultValue=""
          render={({ inputProps, meta, renders }) => {
            return (
              <div>
                <label htmlFor={meta.uuid}>First Name</label>
                <input id={meta.uuid} {...inputProps} />
                <pre data-testid="meta-firstName">{JSON.stringify(meta)}</pre>
                <pre data-testid="renders">{JSON.stringify(renders)}</pre>
              </div>
            );
          }}
        />

        <PathFormField
          path={['lastName']}
          defaultValue=""
          render={({ inputProps, meta, renders }) => {
            return (
              <div>
                <label htmlFor={meta.uuid}>Last Name</label>
                <input id={meta.uuid} {...inputProps} />
                <pre data-testid="meta-lastName">{JSON.stringify(meta)}</pre>
                <pre data-testid="renders">{JSON.stringify(renders)}</pre>
              </div>
            );
          }}
        />

        <h2>Friends</h2>

        <PathFormArray
          path={['friends']}
          defaultValue=""
          renderItem={({ itemPath, index, arrayUtils, meta }) => {
            return (
              <>
                <PathFormField
                  path={[...itemPath, 'firstName']}
                  defaultValue=""
                  render={({ inputProps, meta }) => {
                    return (
                      <div>
                        <label htmlFor={meta.uuid}>Friend First Name</label>
                        <input id={meta.uuid} {...inputProps} />
                        <pre data-testid={`meta-friends-${index}-firstName`}>{JSON.stringify(meta)}</pre>
                        {/* <pre data-testid="renders">{JSON.stringify(renders)}</pre> */}
                      </div>
                    );
                  }}
                />

                <button onClick={() => arrayUtils.remove(['friends'], index)}>Remove Friend</button>
              </>
            );
          }}
        />
      </>,
      { wrapper: TestWrapper }
    );
  });

  it('meta dirty primitives', async () => {
    const firstNameMeta = view.getByTestId('meta-firstName');

    // not dirty
    expect(firstNameMeta).toHaveTextContent(/"dirty":false/);

    // change name
    const firstNameInputEl = view.getByLabelText('First Name');

    userEvent.click(firstNameInputEl);
    userEvent.type(firstNameInputEl, ' ');

    expect(firstNameInputEl).toHaveValue('Joey Joe Joe Jr. ');
    expect(firstNameMeta).toHaveTextContent(/"dirty":true/);

    userEvent.type(firstNameInputEl, 'X');

    expect(firstNameInputEl).toHaveValue('Joey Joe Joe Jr. X');
    expect(firstNameMeta).toHaveTextContent(/"dirty":true/);

    // view.debug();

    // backspace back to the original value
    userEvent.type(firstNameInputEl, '{backspace}{backspace}');

    // no longer dirty
    expect(firstNameInputEl).toHaveValue('Joey Joe Joe Jr.');
    expect(firstNameMeta).toHaveTextContent(/"dirty":false/);
  });

  it('meta dirty arrays', async () => {
    expect(view.getByTestId('dirtyUuids')).toHaveTextContent('[]');

    userEvent.click(view.getByText('Add Friend'));

    expect(view.getByTestId('dirtyUuids')).toHaveTextContent('["uuid-7"]');

    // there are now 3 friends, remove the newly added one (index 2)
    userEvent.click(view.getAllByText('Remove Friend')[2]);

    expect(view.getByTestId('dirtyUuids')).toHaveTextContent('[]');
  });

  describe('reset', () => {
    it('resets to defaultValues if none are given', () => {
      // change an existing value
      userEvent.type(view.getAllByLabelText('Friend First Name')[0], 'Lenny');
      userEvent.type(view.getAllByLabelText('Friend First Name')[1], 'Carl');

      expect(view.getByTestId('dirtyUuids')).toMatchInlineSnapshot(`
        <div
          data-testid="dirtyUuids"
        >
          ["uuid-3","uuid-5"]
        </div>
      `);

      // add new values
      userEvent.click(view.getByText('Add Friend'));
      userEvent.type(view.getAllByLabelText('Friend First Name')[2], 'Moe');

      expect(view.getByTestId('dirtyUuids')).toMatchInlineSnapshot(`
        <div
          data-testid="dirtyUuids"
        >
          ["uuid-3","uuid-5","uuid-7","uuid-25"]
        </div>
      `);

      // now reset the form
      userEvent.click(view.getByText('Reset'));

      expect(view.getAllByLabelText('Friend First Name')[0]).toHaveValue('Homer');
      expect(view.getAllByLabelText('Friend First Name')[1]).toHaveValue('Barney');
      expect(view.getAllByLabelText('Friend First Name')[2]).toBeUndefined();

      expect(view.getByTestId('dirtyUuids')).toMatchInlineSnapshot(`
        <div
          data-testid="dirtyUuids"
        >
          []
        </div>
      `);
    });

    it('resets to given defaultValues', () => {
      // change an existing value
      userEvent.type(view.getAllByLabelText('Friend First Name')[0], 'Lenny');
      userEvent.type(view.getAllByLabelText('Friend First Name')[1], 'Carl');

      expect(view.getByTestId('dirtyUuids')).toMatchInlineSnapshot(`
        <div
          data-testid="dirtyUuids"
        >
          ["uuid-3","uuid-5"]
        </div>
      `);

      // add new values
      userEvent.click(view.getByText('Add Friend'));
      userEvent.type(view.getAllByLabelText('Friend First Name')[2], 'Moe');

      expect(view.getByTestId('dirtyUuids')).toMatchInlineSnapshot(`
        <div
          data-testid="dirtyUuids"
        >
          ["uuid-3","uuid-5","uuid-7","uuid-25"]
        </div>
      `);

      // now reset the form
      userEvent.click(view.getByText('Clear All'));

      // first name / last name cleared
      expect(view.getByLabelText('First Name')).toHaveValue('');
      expect(view.getByLabelText('Last Name')).toHaveValue('');

      // friends cleared
      expect(view.queryAllByLabelText('Friend First Name')).toHaveLength(0);

      // nothing is dirty
      expect(view.getByTestId('dirtyUuids')).toMatchInlineSnapshot(`
        <div
          data-testid="dirtyUuids"
        >
          []
        </div>
      `);
    });
  });
});

describe('PathForm', () => {
  describe('onSubmitEvent', () => {
    const onSubmitParent = jest.fn();
    const onSubmit = jest.fn();

    it('allows handling of form submit event', () => {
      const view = render(
        <div onSubmit={onSubmitParent}>
          <PathFormProvider initialRenderValues={initialRenderValues}>
            <PathForm onSubmit={onSubmit} onSubmitEvent={(event) => event?.stopPropagation()}>
              <button type="submit">Submit</button>
            </PathForm>
          </PathFormProvider>
        </div>
      );

      userEvent.click(view.getByText('Submit'));

      expect(onSubmit).toHaveBeenCalled();
      expect(onSubmit).toHaveBeenCalledWith({
        firstName: 'Joey Joe Joe Jr.',
        lastName: 'Sabadoo',
        friends: [{ firstName: 'Homer' }, { firstName: 'Barney' }],
      });

      // onSubmitEvent stopPropagation
      expect(onSubmitParent).not.toHaveBeenCalled();
    });
  });
});
