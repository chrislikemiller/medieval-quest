import { Resources } from "./resource.model";

export type ValidationSuccess = {
  valid: true;
  update: Partial<Resources>;
}

export type ValidationFailure = {
  valid: false;
  error: string;
}
 
export type ValidationResult = ValidationSuccess | ValidationFailure;
