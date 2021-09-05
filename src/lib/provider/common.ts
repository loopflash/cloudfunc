import { IValidator, IMiddleware, ValidatorObject, MiddlewareObject } from '../internal';

export abstract class ProviderBase{
    private _middleware : MiddlewareObject[] = [];
    private _validator : ValidatorObject[] = [];

    addValidator(validator : IValidator, reference : string){
        this._validator.push({
            validator,
            reference
        });
    }

    addMiddleware(middleware : IMiddleware){
        this._middleware.push({
            middleware,
        });
    }

    get validator(){
        return this._validator;
    }

    get middlewares(){
        return this._middleware;
    }
}

export abstract class Provider extends ProviderBase{
    abstract beforeEntry() : Promise<any[]>;
    abstract afterEntry(...args : any[]) : Promise<any>;
}