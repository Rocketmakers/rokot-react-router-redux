export declare type IError = Error;

export module CustomErrors {
  export declare class Error implements IError {
    name:string;
    message:string;
    stack:string;

    static captureStackTrace(object, objectConstructor?);
  }

  export abstract class CustomError extends Error {
    constructor(public name:string, public message:string) {
      super();
    }
  }

  export class CannotRenderOnServerError extends CustomError {
    constructor(message:string) {
      super("CannotRenderOnServerError", message);
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
