import { fromDotPath } from './usePathForm';

export const validateYupSchema = (schema: any) => async (values: any, addError: any) => {
  try {
    await schema?.validate(values, { abortEarly: false });
  } catch (err) {
    // inner is available when `abortEarly: false`
    err?.inner?.forEach?.((validationError: any) => {
      const path = fromDotPath(validationError.path);
      const { type, message, value } = validationError;
      addError(path, { type, message, value });
    });

    // bubble up yup schema error, stops submission
    throw err;
  }
};
