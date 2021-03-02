import { fromDotPath } from './usePathForm';

export const validateYupSchema = (schema: any) => async (values: any, addError: any) => {
  try {
    await schema?.validate(values);
  } catch (err) {
    err?.inner?.forEach?.((validationError: any) => {
      const path = fromDotPath(validationError.path);
      const { type, message, value } = validationError;
      addError(path, { type, message, value });
    });
  }
};
