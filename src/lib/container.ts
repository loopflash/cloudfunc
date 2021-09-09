import { 
    DependencyElement, 
    DependencyContainer,
    Provider
} from "./internal";

export interface IEntryPoint{
    entry() : Promise<any>;
}

export interface IInterceptor{
    intercept(error : any) : Promise<any>;
}

export type Interceptor = ({new (...args : any[]) : IInterceptor}) | ((error : any) => Promise<any>);

let dependencyContainer : DependencyContainer = null;

export abstract class ContainerProcess{

    protected _dependencyList : DependencyElement[];
    protected _provider : Provider;
    protected _entryPoint : {new (...args : any[]) : IEntryPoint};
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
            const afterEventObject = await this._provider.afterEntry(eventObject);
            return afterEventObject;
        }catch(e : any){
            if(
                typeof this._interceptor === 'function' &&
                this._interceptor.constructor
            ){
                return await dependencyContainer.container
                            .get<IInterceptor>(this._interceptor)
                            .intercept(e);
            }else if(
                typeof this._interceptor === 'function' &&
                !this._interceptor.constructor
            ){
                return await (this._interceptor as (error : any) => Promise<any>)(e);
            }else{
                throw e;
            }
        }
    }

    private async loadDependencies() : Promise<void>{
        if(dependencyContainer) return;
        dependencyContainer = DependencyContainer.makeContainer(
            this._dependencyList
        );
        await dependencyContainer.execute();
        dependencyContainer.container.bind(this._entryPoint).toSelf();
        if(
            typeof this._interceptor === 'function' &&
            this._interceptor.constructor
        ){
            dependencyContainer.container.bind(this._interceptor).toSelf();
        }
    }

    async execute(){
        await this.loadDependencies();
        return await this.process();
    }

}

export class Container extends ContainerProcess{

    addInterceptor(interceptor : Interceptor){
        this._interceptor = interceptor;
    }

    addProvider(provider : Provider){
        this._provider = provider;
    }

    addDependencies(dependencies : DependencyElement[]){
        this._dependencyList = dependencies;
    }

    addEntryPoint(entry : {new (...args : any[]) : IEntryPoint}){
        this._entryPoint = entry;
    }

}