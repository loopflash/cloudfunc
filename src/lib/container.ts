import { 
    DependencyElement, 
    DependencyContainer,
    Provider,
    ModuleImport,
    isClass
} from "./internal";

export interface IEntryPoint{
    entry() : Promise<any>;
}

export interface IInterceptor{
    intercept(error : any) : Promise<any>;
}

export type EntryPointClass = {new (...args : any[]) : IEntryPoint};
export type Interceptor = ({new (...args : any[]) : IInterceptor}) | ((error : any) => Promise<any>);

let dependencyContainer : DependencyContainer = null;

export abstract class ContainerProcess{

    protected _modules : ModuleImport[];
    protected _dependencyList : DependencyElement[];
    protected _provider : Provider;
    protected _entryPoint : EntryPointClass;
    protected _interceptor : Interceptor;

    private async process() : Promise<any>{
        try{
            this._provider.setContainer(dependencyContainer);
            const instance = dependencyContainer.container.get<IEntryPoint>(
                this._entryPoint
            );
            await dependencyContainer.resolver.resolve();
            const beforeEventObject = await this._provider.beforeEntry();
            const eventObject = await instance.entry.apply(
                instance, 
                beforeEventObject
            );
            return await this._provider.afterEntry(eventObject);
        }catch(e : any){
            if(isClass(this._interceptor)){
                return dependencyContainer.container
                    .get<IInterceptor>(this._interceptor)
                    .intercept(e);
            }else if(!isClass(this._interceptor)){
                return (this._interceptor as (error : any) => Promise<any>)(e);
            }else{
                throw e;
            }
        }
    }

    private async loadDependencies() : Promise<void>{
        if(dependencyContainer) return;
        if(!hasEntryPoint(this._entryPoint)){
            throw new Error('Not found EntryPoint, use addEntryPoint() method');
        }
        dependencyContainer = DependencyContainer.makeContainer(
            this._dependencyList,
            this._modules
        );
        dependencyContainer.execute();
        dependencyContainer.container.bind(this._entryPoint).toSelf();
        if(isClass(this._interceptor)){
            dependencyContainer.container.bind(this._interceptor).toSelf();
        }
    }

    async execute(){
        await this.loadDependencies();
        return this.process();
    }

}

export class Container extends ContainerProcess{

    addInterceptor(interceptor : Interceptor){
        this._interceptor = interceptor;
    }

    addProvider(provider : Provider){
        this._provider = provider;
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