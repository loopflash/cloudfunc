import { 
    DependencyElement, 
    DependencyContainer
} from "./internal";

export abstract class Provider{
    abstract beforeEntry() : Promise<any[]>;
    abstract afterEntry(...args : any[]) : Promise<any>;
}

export interface IEntryPoint{
    entry() : Promise<any>;
}

export interface IInterceptor{
    intercept(error : any) : Promise<any>;
}

// export abstract class ContainerExecutor{
//     public _event : any;
//     public _aditionalEvent : any;
//     public _validatorSchema : IValidatorSchema[];
//     public _dependencyList : DependencyElement[];
//     public _entryPoint : any;
//     public _interceptor : IInterceptor<any>;

//     transform(event : any) : any{
//         return event;
//     };

//     protected async executeValidator(event : any) : Promise<void>{
//         const listValidators = this._validatorSchema.map((value) => {
//             return value.validate(event);
//         });
//         await Promise.all(listValidators);
//     };
// }

export type Interceptor = ({new (...args : any[]) : IInterceptor}) | ((error : any) => Promise<any>);

export abstract class ContainerProcess{

    private _containerDI : DependencyContainer;
    protected _dependencyList : DependencyElement[];
    protected _provider : Provider;
    protected _entryPoint : {new (...args : any[]) : IEntryPoint};
    protected _interceptor : Interceptor;

    private async process() : Promise<any>{
        try{
            const beforeEventObject = await this._provider.beforeEntry();
            const instance = this._containerDI.container.get<IEntryPoint>(
                this._entryPoint
            );
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
                return await this._containerDI.container
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
        this._containerDI = DependencyContainer.makeContainer(
            this._dependencyList
        );
        await this._containerDI.execute();
        this._containerDI.container.bind(this._entryPoint).toSelf();
        if(
            typeof this._interceptor === 'function' &&
            this._interceptor.constructor
        ){
            this._containerDI.container.bind(this._interceptor).toSelf();
        }
    }

    async execute(){
        await this.loadDependencies();
        return await this.process();
    }

}

export class Container extends ContainerProcess{

    // addValidator(
    //     validatorSchema : IValidatorSchema,
    // ){
    //     this._validatorSchema.push(validatorSchema);
    // }

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

/***********
 * Validator Schema Code
 */

export interface IValidatorSchema{
    validate(event : any) : Promise<void>;
}