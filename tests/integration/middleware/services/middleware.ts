export function myMiddleware(){
    return async (event : any, context : any) => {
        event.doc++;
    }
}

export function myMiddlewareModule(){
    return {
        service: null,
        params: {
            num: 1
        },
        executor: async ({num}, event : any, context : any) => {
            event.doc = event.doc + num;
        }
    }
}
