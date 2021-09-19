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

let dependencyContainer : DependencyContainer = null;

export abstract class ContainerProcess{

    protected _modules : ModuleImport[];
    protected _dependencyList : DependencyElement[];
    protected _entryPoint : EntryPointClass;
    protected _interceptor : Interceptor;

    private async process(provider : Provider) : Promise<any>{
        try{
            provider.setContainer(dependencyContainer);
            const instance = dependencyContainer.container.get<IEntryPoint>(
                this._entryPoint
            );
            await dependencyContainer.resolver.resolve();
            const beforeEventObject = await provider.beforeEntry();
            const eventObject = await instance.entry.apply(
                instance, 
                beforeEventObject
            );
            return await provider.afterEntry(eventObject);
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

    async load(){
        await this.loadDependencies();
    }

    async execute(provider : Provider){
        if(!dependencyContainer) await this.load();
        return this.process(provider);
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