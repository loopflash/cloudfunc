import { DependencyContainer, MiddlewareObject } from '../internal';

export abstract class ProviderBase{
    private _container : DependencyContainer;
    private _middleware : MiddlewareObject[] = [];
    private _state : any = {};

    setContainer(container : DependencyContainer){
        this._container = container;
    }

    addMiddleware(middleware : MiddlewareObject){
        this._middleware.push(middleware);
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