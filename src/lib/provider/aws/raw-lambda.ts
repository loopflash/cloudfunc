import { awsFormatMiddleware, AwsProvider } from './lib/core';
import { IValidator, executeValidator, executeMiddleware } from '../../internal';

export class RawLambda extends AwsProvider{

    constructor(){
        super();
    }

    async beforeEntry(): Promise<any[]> {
        const format = formatInputRawLambda(
            this._event,
            this._context
        );
        await executeMiddleware(
            awsFormatMiddleware(
                this._event,
                this._context
            ),
            this.middlewares
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
    Context = any
> = {
    event: Event,
    context: Context
}

/*******
 * Create format for input API GATEWAY
 */

function formatInputRawLambda(event : any, context : any){
    return {
        event,
        context
    }
}

/*******
 * Create format for output API GATEWAY
 */
 function formatOutputRawLambda(output : any){
    return output;
}