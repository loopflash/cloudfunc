import { Container } from 'inversify';

export const metadataKeyMiddleware = 'entry:middleware';

export type MiddlewareExecutor = (...args : any[]) => Promise<void>;
export type MiddlewareDynamic = {
    service: any,
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

/**
 * Add middleware to entry point
 * 
 * @param fn - Middleware hook {@link MiddlewareParam}
 * 
 * @public
 */
export function Middleware(fn : MiddlewareParam, order : MiddlewareOrder = MiddlewareOrder.INPUT){
    return (target : any, targetKey: string, descriptor : any) => {
        const middlewares = Reflect.getMetadata(metadataKeyMiddleware, descriptor.value) ?? [];
        Reflect.defineMetadata(metadataKeyMiddleware, [
            ...middlewares,
            {
                ...adapterMiddleware(fn),
                order
            }
        ], descriptor.value);
    }
}

export async function executeMiddleware(
    args : any[],
    middlewares : MiddlewareDynamic[],
    container : Container
) : Promise<void>{
    for(const element of middlewares){
        const {executor, params, service, source} = element;
        const getService = service ? container.get(service) : null;
        let argsToPass : any[];
        if(source === 'function'){
            argsToPass = args;
        }else{
            argsToPass = [params, ...args];
        }
        await executor.apply(getService, argsToPass);
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

export function getMiddlewares(entryPoint : any){
    const middlewares = (Reflect.getMetadata(metadataKeyMiddleware, entryPoint.prototype.entry) ?? []) as MiddlewareObject[];
    return {
        input: middlewares.filter(value => value.order === MiddlewareOrder.INPUT),
        output: middlewares.filter(value => value.order === MiddlewareOrder.OUTPUT),
    }
}