import { IValidator, executeValidator, executeMiddleware, awsFormatMiddleware, AwsProvider } from '../../internal';

export class RawLambda extends AwsProvider{

    constructor(){
        super();
    }

    async beforeEntry(): Promise<any[]> {
        const format = formatInputRawLambda(
            this._event,
            this._context,
            this.state
        );
        await executeMiddleware(
            awsFormatMiddleware(
                this._event,
                this._context,
                this.state
            ),
            this.middlewares,
            this.container.container
        );
        await executeValidator(format, this.validator);
        return [format];
    }
    
    async afterEntry(payload : any): Promise<any> {
        return formatOutputRawLambda(payload);
    }

    addValidator(validator : {new (...args: any) : IValidator}, reference : string){
        super.addValidator(validator, reference);
    }

}

/*******
 * General usage
 */

export type EventRawLambda<
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

function formatInputRawLambda(event : any, context : any, state : any){
    return {
        event,
        context,
        state
    }
}

/*******
 * Create format for output API GATEWAY
 */
 function formatOutputRawLambda(output : any){
    return output;
}