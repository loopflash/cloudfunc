import { executeMiddleware, azureFormatMiddleware, AzureProvider } from '../../internal';

/** @public */
export class AzureRawFunction extends AzureProvider{

    constructor(){
        super();
    }

    async beforeEntry(): Promise<any[]> {
        const format = formatInputRawFunction(
            this._request,
            this._context,
            this.state
        );
        await executeMiddleware(
            azureFormatMiddleware(
                this._context,
                this._request,
                this.state
            ),
            this.middlewares,
            this.container.container
        );
        return [format];
    }
    
    async afterEntry(payload : any): Promise<any> {
        return formatOutputRawFunction(payload);
    }

}

/*******
 * General usage
 */

export type EventAzureRawFunction<
    Request = any,
    Context = any,
    State = any
> = {
    request: Request,
    context: Context,
    state: State
}

/*******
 * Create format for input API GATEWAY
 */

function formatInputRawFunction(request : any, context : any, state : any){
    return {
        request,
        context,
        state
    }
}

/*******
 * Create format for output API GATEWAY
 */
function formatOutputRawFunction(output : any){
    return output;
}