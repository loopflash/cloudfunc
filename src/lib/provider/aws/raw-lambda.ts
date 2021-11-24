import { executeMiddleware, AwsProvider } from '../../internal';

/** @public */
export class AwsRawLambda extends AwsProvider{

    constructor(){
        super();
    }

    async beforeEntry(middlewares : any[]): Promise<any[]> {
        const args = this.args;
        await executeMiddleware(
            args,
            middlewares,
            this.container.container
        );
        return args;
    }
    
    async afterEntry(payload : any, middlewares : any[]): Promise<any> {
        const args = [
            payload,
            ...this.args
        ];
        await executeMiddleware(
            args,
            middlewares,
            this.container.container
        );
        return payload;
    }

}

/*******
 * General usage
 */

export type EventAwsRawLambda<
    Event = any,
    Context = any,
    State = any
> = {
    event: Event,
    context: Context,
    state: State
}