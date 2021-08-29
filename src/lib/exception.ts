export abstract class Exception<T> extends Error{

    constructor(title: string){
        super(title);
    }

    abstract makeError() : T;

}

export type ExceptionResult = {
    code: CodeError,
    payload: any
}

export enum CodeError{
    VALIDATOR,
}

export class ValidatorException extends Exception<ExceptionResult>{

    constructor(
        private _payload: any,
    ){
        super('Invalid payload');
        Object.setPrototypeOf(this, ValidatorException.prototype);
    }

    makeError(){
        return {
            code: CodeError.VALIDATOR,
            payload: this._payload
        }
    }

}