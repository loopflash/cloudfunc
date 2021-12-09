import { DependencyContainer, executeMiddleware, getDecorators, ProcessInfo } from '../internal';

export type Providers = 'aws' | 'gcp' | 'azure';

/** @public */
export abstract class ProviderBase{
    private _args : any[];
    private _container : DependencyContainer;
    private _state : any = {};
    abstract _provider : Providers;

    /**
     * Execute before to enter on {@link entry() function} declare on 
     */
    abstract beforeEntry(middlewares : any[], processInfo : ProcessInfo) : Promise<any[]>;
    abstract afterEntry(input : any, middlewares : any[], processInfo : ProcessInfo) : Promise<any>;
    setArgs(args : any[]){
        this._args = args;
    }
    get args(){
        return this._args;
    }

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

    /**
     * Get provider
     * 
     * @returns Provider
     * @readonly
     */
     get provider(){
        return this._provider;
    }
}

/** @public */
export abstract class Provider extends ProviderBase{

    async beforeEntry(middlewares : any[], processInfo : ProcessInfo): Promise<any[]> {
        const args = this.args;
        await executeMiddleware(
            args,
            middlewares,
            this.container.container,
            processInfo
        );
        const decorators = getDecorators(processInfo.entry).map((element : string) => (
            processInfo.decoratorValues[element]
        ));
        return [...args, ...decorators];
    }
    
    async afterEntry(payload : any, middlewares : any[], processInfo : ProcessInfo): Promise<any> {
        const args = [
            payload,
            ...this.args
        ];
        await executeMiddleware(
            args,
            middlewares,
            this.container.container,
            processInfo
        );
        return payload;
    }
    
}