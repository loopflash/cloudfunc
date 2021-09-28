import { DependencyContainer, MiddlewareObject } from '../internal';

/** @public */
export abstract class ProviderBase{
    private _container : DependencyContainer;
    private _middleware : MiddlewareObject[] = [];
    private _state : any = {};

    /**
     * Set global container
     * 
     * @param container - Instance of {@link DependencyContainer}
     */
    setContainer(container : DependencyContainer){
        this._container = container;
    }

    /**
     * Add middleware
     * 
     * @param container - Instance of {@link DependencyContainer}
     */
    addMiddleware(middleware : MiddlewareObject){
        this._middleware.push(middleware);
    }

    /**
     * Get all middlewares
     * 
     * @returns Group of middlewares
     * @readonly
     */
    get middlewares(){
        return this._middleware;
    }

    /**
     * Get container
     * 
     * @returns Container
     * @readonly
     */
    get container(){
        return this._container;
    }

    /**
     * Get state
     * 
     * @returns State
     * @readonly
     */
    get state(){
        return this._state;
    }
}

export abstract class Provider extends ProviderBase{
    /**
     * Execute before to enter on {@link entry() function} declare on 
     */
    abstract beforeEntry() : Promise<any[]>;
    abstract afterEntry(...args : any[]) : Promise<any>;
}