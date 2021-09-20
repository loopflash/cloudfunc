import { executeMiddleware, GcpProvider, gcpFormatMiddleware } from '../../internal';

export class GcpRawFunction extends GcpProvider{

    constructor(){
        super();
    }

    async beforeEntry(): Promise<any[]> {
        const format = formatInputRawFunction(
            this._event,
            this._context,
            this.state
        );
        await executeMiddleware(
            gcpFormatMiddleware(
                this._event,
                this._context,
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

export type EventGcpRawFunction<
    Event = any,
    Context = any,
    State = any
> = {
    event: Event,
    context: Context,
    state: State
}

/*******
 * Create format for input API GATEWAY
 */

function formatInputRawFunction(event : any, context : any, state : any){
    return {
        event,
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