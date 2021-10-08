import { Provider } from '../../../internal';

/** @public */
export abstract class AzureProvider extends Provider{

    private _providerName : string = 'azure';
    protected _context : any = {};
    protected _request : any = {};

    constructor(){
        super();
    }

    setRequest(request : any){
        this._request = request;
    };

    setContext(context : any){
        this._context = context;
    };

    get providerName(){
        return this._providerName;
    }

}

export function azureFormatMiddleware(
    context : any,
    request: any,
    state : any
){
    return {
        azure: {
            context,
            request,
            state
        }
    }
}