import { 
    Container,
    inject,
    injectable,
    optional,
    interfaces,
    tagged,
    named
} from "inversify";
import { nanoid } from 'nanoid';
import { DepGraph } from 'dependency-graph';

export interface IActivation{
    onActivation() : Promise<void>;
}

export type BindType = string | symbol | {new (...args : any[]) : any}

export type DependencyElementObject = {
    bind: BindType,
    to?: any,
}

export type DependencyElement = DependencyElementObject | 
                                {new (...args : any[]) : any}

export type DependencyModule = {
    modules: DependencyModule[],
    dependencies: DependencyElement[]
}

export class DependencyContainer{

    private _container : interfaces.Container;
    private _resolver : ResolverDependency = new ResolverDependency();
    private _graphPackage : DepGraph<string> = new DepGraph();
    private _mapPackages : {
        [key : string]: any
    } = {} as any;

    constructor(
        private _dependencyList : DependencyElement[],
        private _modulesList : any[]
    ){}

    static makeContainer(
        dependencyList : DependencyElement[],
        modulesList : any[]
    ){
        return new DependencyContainer(dependencyList, modulesList);
    }

    execute(){
        this.resolvePackages();
        this.resolveDependencies();
    }

    resolvePackages(){
        const rootModules = this._modulesList;
        const iteration = (packages : any[], dependsOn : string) => {
            for(const element of packages){
                const getId = Reflect.getMetadata('package:id', element);
                const {
                    packages,
                    services
                } = new element().onPackage();
                this._mapPackages[getId] = services;
                this._graphPackage.addNode(getId);
                if(!(dependsOn === '')){
                    this._graphPackage.addDependency(dependsOn, getId);
                }
                iteration(packages, getId);
            }
        }
        iteration(rootModules, '');
    }

    resolveDependencies(){
        const principalServices = this._dependencyList;
        const graph = this._graphPackage.overallOrder();
        const ids = [];
        // Insert root services in graph for normalization
        const rootServicesId = nanoid(8);
        graph.push(rootServicesId);
        this._mapPackages[rootServicesId] = principalServices;
        // End normalization
        const iterator = (
            index : number
        ) => {
            const scopeModule = new Container({
                defaultScope: 'Singleton',
                skipBaseClassChecks: true,
                autoBindInjectable: true,
            });
            const id = graph[index];
            const services = this._mapPackages[id];
            const nextIndex = index + 1;
            if(graph[nextIndex]) scopeModule.parent = iterator(nextIndex);
            for(const element of services){
                const ref = normalizeBind(element);
                const subId = 'A';
                if(typeof ref.to === 'function'){
                    const getAllContext = Reflect.getMetadata('service:context', ref.to) ?? [];
                    (getAllContext as any[]).forEach((invoke) => {
                        invoke(id, subId);
                    });
                    const binding = scopeModule.bind(ref.bind).to(ref.to);
                    // binding.when((request: interfaces.Request) => {
                    //     return request.target.name.equals(id);
                    // });
                    const hasActivation = hasActivationHandler(ref.to);
                    binding.onActivation((_ : any, self : IActivation) => {
                        const ctx = self;
                        if(hasActivation){
                            this._resolver.addActivation({
                                handler: ctx.onActivation,
                                ctx: ctx as any as ActivationClassHandler,
                            });
                        }
                        return ctx;
                    });
                }else{
                    console.log("--->", id, subId)
                    const binding = scopeModule.bind(ref.bind).toDynamicValue(() => {
                        return ref.to;
                    });
                    ids.push(id);
                    binding.whenTargetNamed(id);
                }
            }
            return scopeModule;
        }
        const container = iterator(0);
        this._container = container;
        console.log("--->", ids)
    }

    public get container(){
        return this._container;
    }

    public get graph(){
        return this._graphPackage;
    }

    public get mapPackages(){
        return this._mapPackages;
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
    handler(): Promise<void>,
    ctx: ActivationClassHandler
}

/***
 * Decorator for Injectable
 */

export function Package(){
    return (target : any) => {
        Reflect.defineMetadata('package:id', nanoid(8), target);
    }
}

export function Injectable(){
    return (target : any) => {
        injectable()(target);
    }
}

export function Inject(key : string | symbol){
    return (target : any, targetKey: string, index : number) => {
        inject(key)(target, targetKey, index);
        const servicesContext = Reflect.getMetadata('service:context', target) ?? [];
        const func = (id : string, random : string) => {
            console.log("--->", id,  target, targetKey, index)
            named(id)(target, targetKey, index);
        };
        Reflect.defineMetadata('service:context', [
            ...servicesContext,
            func
        ], target);
    }
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

function normalizeBind(binding : any) : DependencyElementObject{
    if(typeof binding === 'function'){
        return {
            to: binding,
            bind: binding
        }
    }
    return binding;
}