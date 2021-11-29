import { Injectable } from "../../../../src";
import { Service1 } from "./service1";

export function myMiddleware(){
    return async (params, event : any, context : any) => {
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

@Injectable()
export class MyMiddlewareService{

    constructor(
        private _service : Service1
    ){}

    static myMiddleware(){
        return {
            service: MyMiddlewareService,
            params: {},
            executor: async (service : MyMiddlewareService, {num}, event : any, context : any) => {
                event.doc = service._service.getData() + event.doc;
            }
        }
    }

}
