import { Provider } from '../../../internal';

/** @public */
export abstract class AwsProvider extends Provider{

    private _providerName : string = 'aws';

    constructor(){
        super();
    }

    get providerName(){
        return this._providerName;
    }

}

export function awsFormatMiddleware(
    event : any,
    context : any,
    state : any
){
    return {
        aws: {
            event,
            context,
            state
        }
    }
}