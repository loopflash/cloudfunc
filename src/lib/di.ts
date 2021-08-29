import { 
    Container as InversifyContainer,
    interfaces as InversifyInterfaces
} from "inversify";
import { DepGraph } from 'dependency-graph';

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