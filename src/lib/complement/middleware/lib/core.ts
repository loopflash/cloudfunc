import { Container } from 'inversify';
import { BindType, EntryPointClass, ProcessInfo } from '../../../internal';

export const metadataKeyMiddleware = 'entry:middleware';
export const metadataKeyArgsDecorator = 'entry:argsDecorator';

export type MiddlewareExecutor = (...args : any[]) => Promise<void>;
export type MiddlewareDynamic = {
    service: BindType,
    executor: MiddlewareExecutor,
    params: any,
    source?: 'module' | 'function'
}
export type MiddlewareParam = MiddlewareExecutor | MiddlewareDynamic;
export enum MiddlewareOrder{
    INPUT,
    OUTPUT
}
export type MiddlewareObject = MiddlewareDynamic & {
    order: MiddlewareOrder
};
export type MiddlewareParams<T = {}> = {
    /**
     * Get provider
     */
    provider: 'aws' | 'gcp' | 'azure',
    /**
     * Stop middleware flow
     * 
     * @param obj - Return data directly from the function/lambda (optional)
     */
    finish: (obj : any) => void,
    /**
     * Set decorator value
     * 
     * @param key - The decorator's key to read
     * @param value - The value to be set in the key
     */
    setDecoratorValue: (key : string | symbol, value : any) => void
} & T;

/**
 * Add middleware to entry point
 * 
 * @param fn - Middleware hook {@link MiddlewareParam}
 * @param order - Middleware order {@link MiddlewareOrder}
 * 
 * @public
 */
export function Middleware(fn : MiddlewareParam, order : MiddlewareOrder = MiddlewareOrder.INPUT){
    return (target : any, targetKey: string, descriptor : any) => {
        const middlewares = Reflect.getMetadata(metadataKeyMiddleware, descriptor.value) ?? [];
        Reflect.defineMetadata(metadataKeyMiddleware, [
            {
                ...adapterMiddleware(fn),
                order
            },
            ...middlewares,
        ], descriptor.value);
    }
}

export async function executeMiddleware(
    args : any[],
    middlewares : MiddlewareDynamic[],
    container : Container,
    provider: ProcessInfo
) : Promise<void>{
    const paramsProvider = {
        provider: provider.provider as any,
        finish: (obj : any = null) => {
            provider.finish.flag = true;
            provider.finish.response = obj;
        },
        setDecoratorValue: (key : string | symbol, value : any) => {
            provider.decoratorValues[key] = value;
        }
    } as MiddlewareParams;
    for(const element of middlewares){
        const {executor, params, service, source} = element;
        const getService = service ? container.get(service) : null;
        let argsToPass : any[];
        if(source === 'function'){
            argsToPass = [paramsProvider, ...args];
        }else{
            const paramsWithProvider = {
                ...params,
                ...paramsProvider
            };
            argsToPass = getService ? [getService, paramsWithProvider, ...args] : [paramsWithProvider, ...args];
        }
        await executor.apply(null, argsToPass);
        if(provider.finish.flag) break;
    }
}

function adapterMiddleware(element : MiddlewareParam) : MiddlewareDynamic{
    if(typeof element === 'function'){
        return {
            service: null,
            params: null,
            executor: element,
            source: 'function'
        }
    }
    return {
        ...element,
        source: 'module'
    };
}

export function getMiddlewares(entryPoint : EntryPointClass){
    const middlewares = (Reflect.getMetadata(metadataKeyMiddleware, entryPoint.prototype.entry) ?? []) as MiddlewareObject[];
    return {
        input: middlewares.filter(value => value.order === MiddlewareOrder.INPUT),
        output: middlewares.filter(value => value.order === MiddlewareOrder.OUTPUT),
    }
}

/**
 * Create a decorator to be used at the entry point
 * 
 * @param key - Key of the decorator
 * @returns The reference of value setted in middleware
 * @public
 */
export function createDecorator(key : string | symbol){
    return (target : any, targetKey: string, index: number) => {
        const argsDecorator = Reflect.getMetadata(metadataKeyArgsDecorator, target, targetKey) ?? [];
        Reflect.defineMetadata(metadataKeyArgsDecorator, [
            key,
            ...argsDecorator,
        ], target, targetKey);
    }
}

export function getDecorators(entryPoint : EntryPointClass){
    return Reflect.getMetadata(metadataKeyArgsDecorator, entryPoint.prototype, 'entry') as any[] ?? [];
}