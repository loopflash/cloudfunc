import { Container } from 'inversify';

export interface IMiddleware{
    onCall(event : MiddlewareEvent) : Promise<void>;
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

export type MiddlewareObject = {new (...args: any) : IMiddleware};

export async function executeMiddleware(
    event : MiddlewareEvent,
    validators : MiddlewareObject[],
    container : Container

) : Promise<void>{
    for(const element of validators){
        const getRef = container.isBound(element) ? (
            container.get<any>(element)
        ) : (new element());
        await getRef.onCall(event);
    }
}