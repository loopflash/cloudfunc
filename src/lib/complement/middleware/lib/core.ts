import { Container } from 'inversify';

export const metadataKeyMiddleware = 'entry:middleware';

export type MiddlewareExecutor = (...args : any[]) => Promise<void>;
export type MiddlewareDynamic = {
    service: any,
    executor: MiddlewareExecutor,
    params: any
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
    return (target : any, targetKey: string) => {
        const middlewares = Reflect.getMetadata(metadataKeyMiddleware, target, targetKey) ?? [];
        Reflect.defineMetadata(metadataKeyMiddleware, [
            ...middlewares,
            {
                ...adapterMiddleware(fn),
                order
            }
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

export function getMiddlewares(entryPoint : any){
    const middlewares = (Reflect.getMetadata(metadataKeyMiddleware, entryPoint, 'entry') ?? []) as MiddlewareObject[];
    return {
        input: middlewares.filter(value => value.order === MiddlewareOrder.INPUT),
        output: middlewares.filter(value => value.order === MiddlewareOrder.OUTPUT),
    }
}