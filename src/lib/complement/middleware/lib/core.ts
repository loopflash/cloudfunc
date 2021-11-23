import { Container } from 'inversify';

export type MiddlewareExecutor = (...args : any[]) => Promise<void>;
export type MiddlewareDynamic = {
    service: any,
    executor: MiddlewareExecutor,
    params: any
}
export type MiddlewareParam = MiddlewareExecutor | MiddlewareDynamic;

/**
 * Add middleware to entry point
 */
export function Middleware(fn : MiddlewareParam){
    return (target : any, targetKey: string) => {
        const middlewares = Reflect.getMetadata('entry:middleware', target, targetKey) ?? [];
        Reflect.defineMetadata('entry:middleware', [
            ...middlewares,
            fn
        ], target, targetKey);
    }
}

export async function executeMiddleware(
    args : any[],
    middlewares : MiddlewareParam[],
    container : Container
) : Promise<void>{
    for(const element of middlewares){
        const {executor, params, service} = adapterMiddleware(element);
        const getService = service ? container.get(service) : null;
        await executor.apply(getService, [params, ...args]);
    }
}

function adapterMiddleware(element : MiddlewareParam) : MiddlewareDynamic{
    if(typeof element === 'function'){
        return {
            service: null,
            params: null,
            executor: element
        }
    }
    return element;
}