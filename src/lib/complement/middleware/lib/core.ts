export interface IMiddleware{
    onCall(event : MiddlewareEvent) : Promise<void>;
}

export type MiddlewareEvent = {
    aws?: {
        event: any,
        context: any
    },
    google?: {
        request: any,
        response: any
    }
}

export type MiddlewareObject = {
    middleware: IMiddleware
}

export async function executeMiddleware(
    event : MiddlewareEvent,
    validators : MiddlewareObject[]
) : Promise<void>{
    for(const item of validators){
        await item.middleware.onCall(event);
    }
};