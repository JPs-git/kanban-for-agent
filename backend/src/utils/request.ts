import { Request } from 'express';

export const getParam = (req: Request, name: string, defaultValue?: string): string | undefined => {
  const param = req.params[name];
  const result = Array.isArray(param) ? param[0] : param;
  return result !== undefined ? result : defaultValue;
};

export const getQueryParam = (req: Request, name: string, defaultValue?: string): string | undefined => {
  const param = req.query[name];
  let result: string | undefined;
  if (Array.isArray(param)) {
    result = param[0] as string;
  } else {
    result = param as string | undefined;
  }
  return result !== undefined ? result : defaultValue;
};

export const validateRequiredFields = (body: object, fields: string[]): string[] => {
  const missingFields: string[] = [];
  for (const field of fields) {
    const value = (body as Record<string, unknown>)[field];
    if (value === undefined || value === null) {
      missingFields.push(field);
    }
  }
  return missingFields;
};