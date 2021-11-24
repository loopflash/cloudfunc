import { 
    DependencyElement, 
    DependencyContainer,
    Provider,
    ModuleImport,
    isClass,
    metadataKeyMiddleware,
    getMiddlewares
} from "./internal";

export interface IEntryPoint{
    /**
     * Execute entry logic
     * 
     * @param args - All context params of provider
     * @returns Any value
     */
    entry(...args : any[]) : Promise<any>;
}

export interface IInterceptor{
    /**
     * Execute intercept logic
     * 
     * @param error - Exception info
     * @returns Any value
     */
    intercept(error : any) : Promise<any>;
}

/**
 * Class definition implements {@link IEntryPoint}
 */
export type EntryPointClass = {new (...args : any[]) : IEntryPoint};
/**
 * Class definition implements {@link IInterceptor}
 */
export type Interceptor = ({new (...args : any[]) : IInterceptor});

/** @public */
export abstract class ContainerProcess{

    private _container : DependencyContainer;
    protected _modules : ModuleImport[] = [];
    protected _dependencyList : DependencyElement[] = [];
    protected _entryPoint : EntryPointClass;
    protected _interceptor : Interceptor;

    /**
     * Execute all logic since middleware to lambda/function
     * 
     * @param provider - Instance of provider for execution
     * @returns Any value from lambda/function
     */
    private async process(provider : Provider) : Promise<any>{
        try{
            provider.setContainer(this._container);
            const instance = this._container.container.get<IEntryPoint>(this._entryPoint);
            const middlewares = getMiddlewares(this._entryPoint);
            const beforeEventObject = await provider.beforeEntry(middlewares.input);
            const eventObject = await instance.entry.apply(
                instance, 
                beforeEventObject
            );
            return await provider.afterEntry(eventObject, middlewares.output);
        }catch(e : any){
            if(isClass(this._interceptor)){
                return this._container.container
                    .get<IInterceptor>(this._interceptor)
                    .intercept(e);
            }else{
                throw e;
            }
        }
    }

    /**
     * Execute all activation methods of dependencies
     * 
     */
    private async loadDependencies() : Promise<void>{
        if(!hasEntryPoint(this._entryPoint)){
            throw new Error('Not found EntryPoint, use addEntryPoint() method');
        }
        this._container = DependencyContainer.makeContainer(
            this._dependencyList,
            this._modules
        );
        this._container.execute();
        this._container.container.bind(this._entryPoint).toSelf();
        if(isClass(this._interceptor)){
            this._container.container.bind(this._interceptor).toSelf();
        }
        this._container.container.get<IEntryPoint>(
            this._entryPoint
        );
        await this._container.resolver.resolve();
    }

    /**
     * Load all dependencies injected
     * 
     * @public
     */
    async load(){
        await this.loadDependencies();
    }

    /**
     * Execute logic of lambda/function of provider
     * 
     * @remarks
     * Execute logic from class set in {@link Container.addEntryPoint addEntryPoint()}.
     * 
     * @public
     */
    async execute(provider : Provider){
        if(!this._container) await this.load();
        return this.process(provider);
    }

    /**
     * Get reference of container
     * 
     * @returns Instance of container
     * 
     * @readonly @public
     */
    get container(){
        return this._container.container;
    }

}

/** @public */
export class Container extends ContainerProcess{

    /**
     * Set an interceptor, this means than the class selected for the interceptor will be executed when a exception is throw.
     *
     * @param interceptor - Class than implements {@link IInterceptor} interface
     * 
     * @public
     */
    addInterceptor(interceptor : Interceptor){
        this._interceptor = interceptor;
    }

    /**
     * Set multiple services than going to enable an injection of a service in the container and this will be available for usage in all components injectables.
     *
     * @param dependencies - Array of {@link DependencyElement} objects
     * 
     * @public
     */
    addServices(dependencies : DependencyElement[]){
        this._dependencyList = dependencies;
    }

    /**
     * Set multiple modules than going to enable an injection of couple services in the container and this will be available for usage in all components injectables.
     *
     * @param modules - Array of {@link ModuleImport} objects
     * 
     * @public
     */
    addModules(modules : ModuleImport[]){
        this._modules = modules;
    }

    /**
     * Set entry point, this means than the class selected for the entry point will be executed when the lambda/function is running.
     *
     * @param entry - Class than implements {@link IEntryPoint} interface
     * 
     * @public
     */
    addEntryPoint(entry : {new (...args : any[]) : IEntryPoint}){
        this._entryPoint = entry;
    }

}

/***
 * Detect if is a entry point class
 */
function hasEntryPoint(entryPoint : EntryPointClass){
    return entryPoint && isClass(entryPoint);
}