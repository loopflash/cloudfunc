import { 
    Container,
    inject,
    injectable,
    optional,
    interfaces,
    targetName
} from "inversify";
import { nanoid } from 'nanoid';
import { DepGraph } from 'dependency-graph';
import { isClass } from "./internal";

export type ModuleImport = {new (...args : any[]) : IPackage} | PackageStaticObject;

export interface IPackage{
    /**
     * Logic of package creator
     */
    onPackage() : PackageObject
}

export type PackageObject = {
    packages: ModuleImport[],
    services: DependencyElement[]
}

export type PackageStaticObject = {
    context : any
} & PackageObject;

export type BindType = string | symbol | {new (...args : any[]) : any}

export type DependencyElementObject = {
    bind: BindType,
    scope?: 'local' | 'global'
    to?: any,
}

export type DependencyElement = DependencyElementObject | 
    {new (...args : any[]) : any}

export type DependencyModule = {
    modules: DependencyModule[],
    dependencies: DependencyElement[]
}

export interface IActivation{
    /**
     * Logic of activation service
     */
    onActivation() : Promise<void>;
}

export class DependencyContainer{

    private _container : Container = new Container({
        defaultScope: 'Singleton',
        skipBaseClassChecks: true,
        autoBindInjectable: true,
    });
    private _resolver : ResolverDependency = new ResolverDependency();
    private _graphPackage : DepGraph<string> = new DepGraph();
    private _mapPackages : {
        [key : string]: any
    } = {} as any;

    constructor(
        private _dependencyList : DependencyElement[],
        private _modulesList : ModuleImport[]
    ){}

    /**
     * Static generator of instances of Container
     */
    static makeContainer(
        dependencyList : DependencyElement[],
        modulesList : ModuleImport[]
    ){
        return new DependencyContainer(dependencyList, modulesList);
    }

    /**
     * Execute all resolvers
     */
    execute(){
        this.resolvePackages();
        this.resolveDependencies();
    }

    /**
     * Generate graph with packages
     */
    private resolvePackages(){
        const rootModules = this._modulesList;
        const iteration = (moduleImport : ModuleImport[], dependsOn : string) => {
            for(const element of moduleImport){
                const {
                    id,
                    packages,
                    services
                } = normalizeModule(element);
                this._mapPackages[id] = services;
                this._graphPackage.addNode(id);
                if(dependsOn !== ''){
                    this._graphPackage.addDependency(dependsOn, id);
                }
                iteration(packages, id);
            }
        }
        iteration(rootModules, '');
    }

    /**
     * Generate link for each package
     */
    private resolveDependencies(){
        const scopeModule = this._container;
        const principalServices = this._dependencyList;
        const graph = this._graphPackage.overallOrder();
        // Insert root services in graph for normalization
        const rootServicesId = nanoid(8);
        graph.push(rootServicesId);
        this._mapPackages[rootServicesId] = principalServices;
        // End normalization
        const iterator = (
            index : number
        ) => {
            const id = graph[index];
            const services = this._mapPackages[id];
            const nextIndex = index + 1;
            if(graph[nextIndex]) iterator(nextIndex);
            for(const element of services){
                const ref = normalizeBind(element);
                if(typeof ref.to === 'function'){
                    callLocalTags(ref.to, id);
                    const binding = scopeModule.bind(ref.bind).to(ref.to);
                    if(ref.scope === 'local'){
                        binding.when((request: interfaces.Request) => {
                            return request.target.name.equals(id);
                        });
                    }
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
                    const binding = scopeModule.bind(ref.bind).toConstantValue(ref.to);
                    if(ref.scope === 'local'){
                        binding.when((request: interfaces.Request) => {
                            return request.target.name.equals(id);
                        });
                    }
                }
            }
        }
        iterator(0);
    }

    /**
     * Get instance of Container
     * 
     * @returns Instance of Container
     * @readonly @public
     */
    public get container(){
        return this._container;
    }

    /**
     * Get graph of packages
     * 
     * @returns Graph of packages
     * @readonly @public
     */
    public get graph(){
        return this._graphPackage;
    }

    /**
     * Get map of packages
     * 
     * @returns Map of packages
     * @readonly @public
     */
    public get mapPackages(){
        return this._mapPackages;
    }

    /**
     * Get instance of Resolver
     * 
     * @returns Instance of {@link ResolverDependency}
     * @readonly @public
     */
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

/**
 * Make a module
 * 
 */
export function Package(){
    return (target : any) => {
        Reflect.defineMetadata('package:id', nanoid(8), target);
    }
}

/**
 * Make a service injectable for application
 * 
 */
export function Injectable(){
    return (target : any) => {
        injectable()(target);
    }
}

/**
 * Inject a service for his utilization
 * 
 * @param key - Key value to reference service
 */
export function Inject(key : string | symbol){
    return (target : any, targetKey: string, index : number) => {
        inject(key)(target, targetKey, index);
    }
}

/**
 * Inject a service for his utilization but with a context inside his module
 * 
 */
export function Local(){
    return (target : any, targetKey: string, index : number) => {
        const servicesContext = Reflect.getMetadata('service:context', target) ?? [];
        const func = (id : string) => {
            targetName(id)(target, targetKey, index);
        };
        Reflect.defineMetadata('service:context', [
            ...servicesContext,
            func
        ], target);
    }
}

/**
 * Set an injection with optionable option
 * 
 */
export function Optional(){
    return optional();
}

/**
 * Detect if is has 'onActivation' method
 */
function hasActivationHandler(target : any){
    return target.prototype && target.prototype.onActivation;
}

/**
 * Normalize differents binds in one
 */
function normalizeBind(binding : any) : DependencyElementObject{
    if(typeof binding === 'function'){
        return {
            to: binding,
            scope: 'global',
            bind: binding
        }
    }
    return binding;
}

/**
 * Normalize differents binds modules in one
 */
function normalizeModule(module : ModuleImport){
    if(isClass(module)){
        const moduleCast = module as any as {new (...args : any[]) : IPackage};
        const { packages, services } = new moduleCast().onPackage();
        return {
            id: Reflect.getMetadata('package:id', module),
            packages,
            services
        }
    }
    const {packages, services, context} = module as PackageStaticObject;
    return {
        id: context,
        packages,
        services
    }
}

/**
 * Call local tags
 */
function callLocalTags(reference : any, id : string){
    const getAllContext = Reflect.getMetadata('service:context', reference) ?? [];
    (getAllContext as any[]).forEach((invoke) => {
        invoke(id);
    });
}