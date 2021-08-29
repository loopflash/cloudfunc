import { 
    Container as InversifyContainer,
    interfaces as InversifyInterfaces
} from "inversify";
import { DepGraph } from 'dependency-graph';
import { AwsProvider, ValidatorException } from "./internal";

export enum Provider{
    AWS,
    GOOGLE,
}

export namespace ProviderCompany{
    export type Aws = Provider.AWS;
    export type Google = Provider.GOOGLE;
}

export type ProviderSelector<T> = T extends ProviderCompany.Aws
    ? AwsProvider
    : AwsProvider;
export type Providers = ProviderCompany.Aws | ProviderCompany.Google;

export function Container<T extends Provider = Provider.AWS>(
    provider? : T
) : ProviderSelector<T>{
    if(provider === Provider.AWS){
        return new AwsProvider();
    }
    if(provider === Provider.GOOGLE){
        return new AwsProvider();
    }
    throw new Error();
}

export abstract class ContainerExecutor{
    public _event : any;
    public _aditionalEvent : any;
    public _validatorSchema : IValidatorSchema[];
    public _dependencyList : DependencyElement[];
    public _entryPoint : any;
    public _interceptor : IInterceptor<any>;

    transform(event : any) : any{
        return event;
    };

    protected async executeValidator(event : any) : Promise<void>{
        const listValidators = this._validatorSchema.map((value) => {
            return value.validate(event);
        });
        await Promise.all(listValidators);
    };
}

export abstract class ContainerProcess extends ContainerExecutor{

    private async process() : Promise<any>{
        try{
            const event = this.transform(this._event);
            await this.executeValidator(
                event
            );
        }catch(e : any){

        }
    }

    async execute(){
        return await this.process();
    }

}

export abstract class ContainerBase extends ContainerProcess{

    addValidator(
        validatorSchema : IValidatorSchema,
    ){
        this._validatorSchema.push(validatorSchema);
    }

    addContext(
        event : any,
        aditional : any[]
    ){
        this._event = event;
        this._aditionalEvent = aditional;
    }

    addEntryPoint(entry : any){
        this._entryPoint = entry;
    }

}

/***********
 * Dependency Container
 */

export type BindType = string | symbol | {new (...args : any[]) : any}

export type DependencyElementObject = {
    bind: BindType,
    to?: any,
    constant?: any
    factory?: (...args : any[]) => any,
    factoryDeps?: BindType[],
}

export type DependencyElement = DependencyElementObject | {new (...args : any[]) : any}

export class DependencyContainer{

    private _container : InversifyContainer;
    private _mapBind : {
        [key in string]: DependencyElementObject
    } = {} as any;
    private _onlyKeysDependencies : string[] = [];
    private _graph : DepGraph<any> = new DepGraph();

    constructor(
        private _dependencyList : DependencyElement[]
    ){
        this._container = new InversifyContainer();
    }

    static makeContainer(
        dependencyList : DependencyElement[]
    ){
        return new DependencyContainer(dependencyList);
    }

    async execute(){
        this.createNodes();
        this.createDependencies();
    }

    private getKeyForMap(element : BindType){
        let key : string;
        switch(typeof element){
            case 'string':
                key = element;
                break;
            case 'symbol':
                key = Symbol.keyFor(element);
                break;
            case 'function':
                /***
                 * TODO: get metadata id from @injectable
                 */
                key = 'a';
                break;
            default:
                throw new Error();
        }
        return key;
    }

    private createNodes(){
        this._dependencyList.forEach((element) => {
            if(
                typeof element === 'object' && 
                    element !== null &&
                    ('bind' in element)
            ){
                const key = this.getKeyForMap(element.bind);
                this._mapBind[
                    key
                ] = element;
                if(
                    element.factoryDeps instanceof Array &&
                    element.factoryDeps.length > 0
                ){
                    this._onlyKeysDependencies.push(key);
                }
                this._graph.addNode(key);
            }
        });
    }

    private createDependencies(){
        this._onlyKeysDependencies.forEach((element) => {
            const ref = this._mapBind[element];
            (ref.factoryDeps ?? []).forEach((item) => {
                const keyTo = this.getKeyForMap(item);
                this._graph.addDependency(element, keyTo);
            });
        });
    }

    private sendToContainer(){
        this._dependencyList.forEach((element) => {
            if(
                typeof element === 'object' && 
                    element !== null &&
                    ('bind' in element)
            ){
                this._container.bind<any>(
                    element.bind
                ).to(element.to);
                return;
            }
            if(
                typeof element === 'object' && 
                    element !== null &&
                    ('constant' in element)
            ){
                this._container.bind<any>(
                    element.bind
                ).toConstantValue(element.constant);
                return;
            }
            if(
                typeof element === 'function' &&
                    element.constructor
            ){
                this._container.bind<any>(
                    element
                ).toSelf();
                return;
            }
        });
    }

    public get graph(){
        return this._graph;
    }

}

/***********
 * Validator Schema Code
 */

export interface IValidatorSchema{
    validate(event : any) : Promise<void>;
}

/***********
 * Interceptor Code
 */

export interface IInterceptor<T>{
    intercept(error : any) : Promise<T>;
}

export type Guard<T> = {
    pass: boolean,
    data: T
}