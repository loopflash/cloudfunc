import { 
    Container,
    inject,
    injectable,
    optional,
    interfaces
} from "inversify";

export interface IActivation{
    onActivation() : Promise<void>;
}

export type BindType = string | symbol | {new (...args : any[]) : any}

export type DependencyElementObject = {
    bind: BindType,
    to?: any,
}

export type DependencyElement = DependencyElementObject | 
                                {new (...args : any[]) : any} |
                                any[]

export class DependencyContainer{

    private _container : interfaces.Container;
    private _resolver : ResolverDependency = new ResolverDependency();
    constructor(
        private _dependencyList : DependencyElement[]
    ){}

    static makeContainer(
        dependencyList : DependencyElement[]
    ){
        return new DependencyContainer(dependencyList);
    }

    async execute(){
        this.resolveDependencies();
    }

    private resolveDependencies(){
        const principalServices = this._dependencyList;
        const modules = [];
        const iterator = (services : DependencyElement[]) => {
            const scopeModule = new Container({
                defaultScope: 'Singleton'
            });
            for(const element of services){
                if(element instanceof Array){
                    iterator(element);
                    continue;
                };
                const ref = normalizeBind(element);
                if(typeof ref.to === 'function'){
                    const binding = scopeModule.bind(ref.bind).to(ref.to);
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
                    scopeModule.bind(ref.bind).toConstantValue(ref.to);
                }
            }
            modules.push(scopeModule);
        }
        iterator(principalServices);
        const rootContainer = Container.merge.apply(null, modules);
        this._container = rootContainer;
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
    handler(): Promise<void>,
    ctx: ActivationClassHandler
}

/***
 * Decorator for Injectable
 */

export function Injectable(){
    return (target : any) => {
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

function normalizeBind(binding : any) : DependencyElementObject{
    if(typeof binding === 'function'){
        return {
            to: binding,
            bind: binding
        }
    }
    return binding;
}