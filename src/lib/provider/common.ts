import { IValidator, IMiddleware, DependencyContainer, ValidatorObject, MiddlewareObject } from '../internal';

export abstract class ProviderBase{
    private _container : DependencyContainer;
    private _middleware : MiddlewareObject[] = [];
    private _state : any = {};
    private _validator : ValidatorObject[] = [];

    setContainer(container : DependencyContainer){
        this._container = container;
    }

    addValidator(validator : {new (...args: any) : IValidator}, reference : string){
        const getRef = this._container.container.isBound(validator) ? (
            this._container.container.get<any>(validator)
        ) : (new validator());
        this._validator.push({
            validator: getRef,
            reference
        });
    }

    addMiddleware(middleware : {new (...args: any) : IMiddleware}){
        this._middleware.push(middleware);
    }

    get validator(){
        return this._validator;
    }

    get middlewares(){
        return this._middleware;
    }

    get container(){
        return this._container;
    }

    get state(){
        return this._state;
    }
}

export abstract class Provider extends ProviderBase{
    abstract beforeEntry() : Promise<any[]>;
    abstract afterEntry(...args : any[]) : Promise<any>;
}