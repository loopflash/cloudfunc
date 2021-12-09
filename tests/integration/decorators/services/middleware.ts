import { createDecorator, Injectable, MiddlewareParams } from "../../../../src";

export const far = Symbol('mykey');
export const bar = Symbol('mykey');

export function myMiddleware(){
    return async (params : MiddlewareParams, event : any, context : any) => {
        params.setDecoratorValue(far, 100);
    }
}

export function myMiddleware2(){
    return async (params : MiddlewareParams, event : any, context : any) => {
        params.setDecoratorValue(bar, 1000);
    }
}


export const GetFar = createDecorator(far);
export const GetBar = createDecorator(bar);