import { awsFormatMiddleware, AwsProvider } from './lib/core';
import { IValidator, executeValidator, executeMiddleware } from '../../internal';

export class ApiGateway extends AwsProvider{

    private _apiGatewaycontext : ApiGatewayContext;

    constructor(
        private _options : ApiGatewayOptions
    ){
        super();
        this._apiGatewaycontext = ApiGatewayContext.makeInstance(
            _options.default
        );
    }

    async beforeEntry(): Promise<any[]> {
        const format = formatInputApiGateway(
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
        return [format, this._apiGatewaycontext];
    }
    
    async afterEntry(payload : any): Promise<any> {
        return formatOutputApiGateway({
            code: this._apiGatewaycontext.code,
            body: payload,
            headers: this._apiGatewaycontext.headers,
        });
    }

    addValidator(validator : {new (...args: any) : IValidator}, reference : ApiGatewayTypeValidator | string){
        super.addValidator(validator, reference);
    }

}

export type ApiGatewayOptions = {
    default?: ApiGatewayContextOptions
}

export type ApiGatewayContextOptions = {
    code?: number,
    headers?: any
}

export class ApiGatewayContext{

    constructor(
        private _options : ApiGatewayContextOptions
    ){}

    static makeInstance(options : ApiGatewayContextOptions){
        return new ApiGatewayContext({
            ...{
                code: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            },
            ...options,
        });
    }

    setCode(code : number){
        this._options.code = code;
    }

    setHeaders(headers : any){
        this._options.headers = {
            ...this._options.headers,
            ...headers
        };
    }

    public get code(){
        return this._options.code;
    }

    public get headers(){
        return this._options.headers;
    }

}

/*******
 * General usage
 */

export type EventApiGateway<
    BodyRequest = any,
    HeadersRequest = any,
    ParamsRequest = any,
    Event = any,
    Context = any
> = {
    params: ParamsRequest,
    headers: HeadersRequest,
    method: string,
    path: string,
    body: BodyRequest,
    event: Event,
    context: Context
}

/*******
 * Create format for input API GATEWAY
 */

function formatInputApiGateway(event : any, context : any){
    return {
        params: event.pathParameters,
        headers: event.headers,
        method: event.httpMethod,
        path: event.path,
        body: typeof event.body === 'string' ? 
                JSON.parse(event.body) : event.body,
        event,
        context
    }
}

/*******
 * Create format for output API GATEWAY
 */
 function formatOutputApiGateway(output : any){
    return {
        statusCode: output.code,
        body: JSON.stringify(output.body),
        headers: output.headers
    }
}

export enum ApiGatewayTypeValidator{
    PARAMS = 'params',
    HEADERS = 'headers',
    METHOD = 'method',
    PATH = 'path',
    BODY = 'body',
    EVENT = 'event',
    CONTEXT = 'context'
}