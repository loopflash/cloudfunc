import { pick } from 'dot-object';

export interface IMiddleware{
    onCall(event : any) : Promise<void>;
}

export type MiddlewareObject = {
    middleware: IMiddleware
}

export async function executeMiddleware(
    event : any,
    validators : MiddlewareObject[]
) : Promise<void>{
    for(const item of validators){
        await item.middleware.onCall(event);
    }
};