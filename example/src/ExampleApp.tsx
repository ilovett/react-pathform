import * as React from 'react';

import { Button, CardActions, Checkbox, FormControlLabel, IconButton, TextField, Tooltip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/DeleteRounded';
import ArrowUpIcon from '@material-ui/icons/ArrowUpwardRounded';
import ArrowDownIcon from '@material-ui/icons/ArrowDownwardRounded';

import {
  PathForm,
  PathFormArray,
  PathFormField,
  PathFormProvider,
  usePathForm,
  usePathFormValue,
  PathFormValidationMode,
} from '../../dist';
import { PathFormDevTools } from './ExamplePathFormDevTools';

const fetchedData = {
  characters: [
    { name: 'Bart', age: '10' },
    { name: 'Homer', age: '42' },
    { name: 'Duff Man', age: '34' },
  ],
};

export const ExampleApp = () => {
  const [mode, setMode] = React.useState<PathFormValidationMode>('onSubmit');

  // This will force the form to be removed and added back to the tree, this way it's possible to change the mode
  const [showForm, setShowForm] = React.useState(true);
  React.useEffect(() => {
    if (!showForm) {
      const timeout = setTimeout(() => setShowForm(true), 100);
      return () => clearTimeout(timeout);
    }
  }, [showForm]);

  const onChangeMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMode(e.target.value as PathFormValidationMode);
    setShowForm(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: 16, margin: 16, border: '1px solid #AAA', borderRadius: 8, backgroundColor: '#F0F0F0' }}>
        <p style={{ margin: 0 }}>
          <strong>Form rules</strong>
        </p>
        <label>
          Select validation mode:
          <select style={{ marginLeft: 8 }} onChange={onChangeMode}>
            <option value="onSubmit">onSubmit</option>
            <option value="onChange">onChange</option>
          </select>
        </label>
      </div>
      {showForm && (
        <PathFormProvider initialRenderValues={fetchedData} mode={mode}>
          <div style={{ display: 'flex', flexGrow: 1, height: '100%' }}>
            <div style={{ width: 800, padding: 25 }}>
              <div style={{ marginBottom: 50 }}>
                <h2>Validations</h2>
                <ul>
                  <li>Must have a name</li>
                  <li>Name can't be 'Joe'</li>
                  <li>Age must be 21 or older</li>
                </ul>
              </div>
              <MyForm />
            </div>
            <aside style={{ flex: 1, overflowY: 'scroll' }}>
              <PathFormDevTools />
            </aside>
          </div>
        </PathFormProvider>
      )}
    </div>
  );
};

const MyForm = () => {
  const { array, isDirty, reset } = usePathForm();

  return (
    <PathForm
      onSubmit={(values) => {
        console.log('onSubmit -> dirty', isDirty());
        console.log('onSubmit -> values', JSON.stringify(values, null, 2));
        // alert(JSON.stringify(values, null, 2));

        // update the form defaultValues
        reset({ defaultValues: values });
      }}
    >
      <PathFormArray
        path={['characters']}
        defaultValue={[]}
        renderItem={({ totalRows, arrayPath, itemPath, index, meta }) => {
          // uncomment, open chrome dev tools and inspect the scope variables
          // debugger;

          return (
            <div key={meta.uuid} style={{ display: 'flex', alignItems: 'center' }}>
              <PathFormField
                path={[...itemPath, 'name']}
                defaultValue=""
                validations={[
                  { type: 'required', message: 'Must give a name.' },
                  { type: 'custom', message: "Name can't be Joe", value: (name) => name.trim().toLowerCase() !== 'joe' },
                ]}
                render={({ inputProps, meta, renders }) => {
                  return (
                    <>
                      <TextField label="Name" {...inputProps} error={!!meta.error} helperText={meta.error?.message} />
                      {/* <pre style={{ fontSize: 10 }}>{JSON.stringify(meta, null, 2)}</pre> */}
                    </>
                  );
                }}
              />

              <PathFormField
                path={[...itemPath, 'age']}
                defaultValue=""
                validations={[{ type: 'min', value: 21, message: 'Must be at least 21 years old.' }]}
                render={({ inputProps, meta, renders }) => {
                  return <TextField label="Age" {...inputProps} error={!!meta.error} helperText={meta.error?.message} />;
                }}
              />

              <PathFormField
                path={[...itemPath, 'someOption']}
                defaultValue={false}
                render={({ inputProps: { onChange, value, ...inputProps } }) => {
                  return (
                    <FormControlLabel
                      label="Some Option"
                      control={<Checkbox color="primary" checked={value} onChange={(event, value) => onChange(value)} {...inputProps} />}
                      {...inputProps}
                      style={{ maxWidth: 215 }}
                    />
                  );
                }}
              />

              <Tooltip title={totalRows > 1 ? 'Delete' : 'At least one required'}>
                <span>
                  <IconButton disabled={totalRows <= 1} onClick={() => array.remove(arrayPath, index)}>
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Move Down">
                <span>
                  <IconButton disabled={totalRows <= 1 || index + 1 === totalRows} onClick={() => array.move(arrayPath, index, index + 1)}>
                    <ArrowDownIcon />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Move Up">
                <span>
                  <IconButton
                    disabled={totalRows <= 1 || index === 0}
                    onClick={() => {
                      array.move(arrayPath, index, index - 1);
                    }}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </div>
          );
        }}
      />

      <CardActions>
        <Button size="small" variant="outlined" color="primary" onClick={() => array.append(['characters'], {})}>
          Add Row
        </Button>
        <Button size="small" variant="outlined" color="primary" onClick={() => reset()}>
          Reset
        </Button>
        <Button size="small" variant="contained" color="primary" type="submit">
          Submit
        </Button>
      </CardActions>
    </PathForm>
  );
};
