import { 
    DependencyElement, 
    DependencyContainer,
    Provider,
    ModuleImport,
    isClass
} from "./internal";

export interface IEntryPoint{
    entry(...args : any[]) : Promise<any>;
}

export interface IInterceptor{
    intercept(error : any) : Promise<any>;
}

export type EntryPointClass = {new (...args : any[]) : IEntryPoint};
export type Interceptor = ({new (...args : any[]) : IInterceptor}) | ((error : any) => Promise<any>);

export abstract class ContainerProcess{

    private _container : DependencyContainer;
    protected _modules : ModuleImport[] = [];
    protected _dependencyList : DependencyElement[] = [];
    protected _entryPoint : EntryPointClass;
    protected _interceptor : Interceptor;

    private async process(provider : Provider) : Promise<any>{
        try{
            provider.setContainer(this._container);
            const instance = this._container.container.get<IEntryPoint>(
                this._entryPoint
            );
            const beforeEventObject = await provider.beforeEntry();
            const eventObject = await instance.entry.apply(
                instance, 
                beforeEventObject
            );
            return await provider.afterEntry(eventObject);
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

    async load(){
        await this.loadDependencies();
    }

    async execute(provider : Provider){
        if(!this._container) await this.load();
        return this.process(provider);
    }

    get container(){
        return this._container.container;
    }

}

export class Container extends ContainerProcess{

    addInterceptor(interceptor : Interceptor){
        this._interceptor = interceptor;
    }

    addServices(dependencies : DependencyElement[]){
        this._dependencyList = dependencies;
    }

    addModules(modules : ModuleImport[]){
        this._modules = modules;
    }

    addEntryPoint(entry : {new (...args : any[]) : IEntryPoint}){
        this._entryPoint = entry;
    }

}

/***
 * Helpers
 */

function hasEntryPoint(entryPoint : EntryPointClass){
    return entryPoint && isClass(entryPoint);
}