import { DependencyContainer } from '../internal';

/** @public */
export abstract class ProviderBase{
    private _container : DependencyContainer;
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

    private _args : any[];

    /**
     * Execute before to enter on {@link entry() function} declare on 
     */
    abstract beforeEntry(middlewares : any[]) : Promise<any[]>;
    abstract afterEntry(input : any, middlewares : any[]) : Promise<any>;
    setArgs(args : any[]){
        this._args = args;
    }
    get args(){
        return this._args;
    }
}