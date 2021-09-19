import { Container } from 'inversify';
import { isClass } from '../../../helper';

export interface IMiddleware{
    onCall(event : MiddlewareEvent, options? : any) : Promise<void>;
}

export type MiddlewareEvent = {
    aws?: {
        event: any,
        context: any
    },
    gcp?: {
        request: any,
        response: any
    }
}

export type MiddlewareObject = MiddlewareClass | MiddlewareObjectWithOptions;
export type MiddlewareObjectWithOptions = {
    middleware: MiddlewareClass,
    options: any
}
export type MiddlewareClass = {new (...args: any) : IMiddleware};

export async function executeMiddleware(
    event : MiddlewareEvent,
    middlewares : MiddlewareObject[],
    container : Container
) : Promise<void>{
    for(const element of middlewares){
        const {middleware, options} = normalizeMiddleware(element);
        const getRef = container.isBound(middleware) ? (
            container.get<any>(middleware)
        ) : (new middleware());
        await getRef.onCall(event, options);
    }
}

function normalizeMiddleware(element : MiddlewareObject) : MiddlewareObjectWithOptions{
    if(isClass(element)){
        return {
            middleware: element as MiddlewareClass,
            options: {}
        }
    }
    return element as MiddlewareObjectWithOptions;
}