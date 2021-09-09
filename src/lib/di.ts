import { 
    Container as InversifyContainer,
    inject,
    injectable,
    optional
} from "inversify";
import { nanoid } from 'nanoid';
import { DepGraph } from 'dependency-graph';

export interface IActivation{
    onActivation() : Promise<void> | void;
}

export type BindType = string | symbol | {new (...args : any[]) : any}

export type DependencyElementObject = {
    bind: BindType,
    to?: any,
    factory?: (...args : any[]) => any,
    factoryDeps?: BindType[],
}

export type DependencyElement = DependencyElementObject | {new (...args : any[]) : any}

export class DependencyContainer{

    private _container : InversifyContainer;
    private _mapBind : {
        [key in string]: DependencyElement
    } = {} as any;
    private _onlyKeysDependencies : string[] = [];
    private _graph : DepGraph<any> = new DepGraph();
    private _resolver : ResolverDependency = new ResolverDependency();

    constructor(
        private _dependencyList : DependencyElement[]
    ){
        this._container = new InversifyContainer({
            defaultScope: 'Singleton'
        });
    }

    static makeContainer(
        dependencyList : DependencyElement[]
    ){
        return new DependencyContainer(dependencyList);
    }

    async execute(){
        this.createNodes();
        this.createDependencies();
        await this.resolveDependencies();
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
                key = Reflect.getMetadata('proto:id', element);
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
                this._mapBind[key] = element;
                if(
                    element.factoryDeps instanceof Array &&
                    element.factoryDeps.length > 0
                ){
                    this._onlyKeysDependencies.push(key);
                }
                this._graph.addNode(key);
            }
            if(
                typeof element === 'function' &&
                    element.constructor
            ){
                const key = this.getKeyForMap(element);
                this._mapBind[key] = {
                    bind: element,
                    to: element
                };
                this._graph.addNode(key);
            }
        });
    }

    private createDependencies(){
        this._onlyKeysDependencies.forEach((element) => {
            const ref = this._mapBind[element];
            if(!(typeof ref === 'function')){
                (ref.factoryDeps ?? []).forEach((item) => {
                    const keyTo = this.getKeyForMap(item);
                    this._graph.addDependency(element, keyTo);
                });
            }
        });
    }

    private async resolveDependencies(){
        const nodes = this.graph.overallOrder();
        for(const element of nodes){        
            const ref = this._mapBind[element];
            if(
                typeof ref === 'object' && 
                    ref !== null &&
                    ('bind' in ref) &&
                    ('to' in ref)
            ){
                if(typeof ref.to === 'function'){
                    const binding = this._container.bind(ref.bind).to(ref.to);
                    const hasActivation = hasActivationHandler(ref.to);
                    if(hasActivation){
                        binding.onActivation((_ : any, self : IActivation) => {
                            this._resolver.addActivation({
                                handler: self.onActivation,
                                ctx: self as any as ActivationClassHandler,
                            });
                            return self;
                        });
                    }
                }else{
                    this._container.bind(ref.bind).toConstantValue(ref.to);
                }
            }else if(
                typeof ref === 'object' && 
                    ref !== null &&
                    ('bind' in ref) &&
                    ('factory' in ref)
            ){
                const hasDeps = ref.factoryDeps instanceof Array &&
                                    ref.factoryDeps.length > 0;
                const deps = (hasDeps ? ref.factoryDeps : []).map((_element) => {
                    const getBind = this._mapBind[this.getKeyForMap(_element)];
                    return this._container.get(getBind.bind);
                });
                const resolve = await ref.factory.apply(null, deps);
                this._container.bind(ref.bind).toConstantValue(resolve);
            }else{
                throw new Error();
            }
        }
    }

    public get graph(){
        return this._graph;
    }

    public get container(){
        return this._container;
    }

    public get resolver(){
        return this._resolver;
    }

}

export class ResolverDependency{

    private _activations : ResolverDependencyActivation[] = [];
    private _resolved = false;

    async resolve(){
        if(this._resolved) return;
        await this.resolveActivation();
        this._resolved = true;
    }

    addActivation(activation : ResolverDependencyActivation){
        this._activations.push(activation);
    }

    private async resolveActivation(){
        for(const element of this._activations){
            await element.handler.call(element.ctx);
        }
    }

    public get activations(){
        return this._activations;
    }

}

export type ActivationClassHandler = {new (...args : any[]) : IActivation};

export type ResolverDependencyActivation = {
    handler: () => void | Promise<void>,
    ctx: ActivationClassHandler
}

/***
 * Decorator for Injectable
 */

export function Injectable(){
    return (target : any) => {
        Reflect.defineMetadata('proto:id', nanoid(8), target);
        injectable()(target);
    }
}

export function Inject(key : string | symbol){
    return inject(key);
}

export function Optional(){
    return optional();
}

/**********
 * Helper
 */

function hasActivationHandler(target : any){
    return target.prototype && target.prototype.onActivation;
}