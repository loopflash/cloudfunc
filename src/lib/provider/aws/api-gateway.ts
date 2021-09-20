import * as cookie from 'cookie';
import { executeMiddleware, awsFormatMiddleware, AwsProvider } from '../../internal';

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
        return [format, this._apiGatewaycontext];
    }
    
    async afterEntry(payload : any): Promise<any> {
        return formatOutputApiGateway({
            code: this._apiGatewaycontext.code,
            body: payload,
            headers: this._apiGatewaycontext.headers,
            multiValueHeaders: this._apiGatewaycontext.multiHeaders,
            isBase64Encoded: this._apiGatewaycontext.isBase64Encoded,
        });
    }

}

export type ApiGatewayOptions = {
    default?: ApiGatewayContextOptions
}

export type ApiGatewayContextOptions = {
    code?: number,
    headers?: any,
    multiValueHeaders?: {
        [key : string]: string[]
    },
    isBase64Encoded?: boolean
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
                },
                multiValueHeaders: {},
                isBase64Encoded: false
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

    setMultiHeaders(headers : any){
        this._options.multiValueHeaders = {
            ...this._options.multiValueHeaders,
            ...headers
        };
    }

    setBase64(isBase64: boolean){
        this._options.isBase64Encoded = isBase64;
    }

    setCookie(key : string, value : string, options : any){
        this._options.multiValueHeaders['Set-Cookie'].push(
            cookie.serialize(key, value, options)
        );
    }

    public get code(){
        return this._options.code;
    }

    public get headers(){
        return this._options.headers;
    }

    public get multiHeaders(){
        return this._options.multiValueHeaders;
    }

    public get isBase64Encoded(){
        return this._options.isBase64Encoded;
    }

}

/*******
 * General usage
 */

export type EventAwsApiGateway<
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
    context: Context,
    state: any
}

/*******
 * Create format for input API GATEWAY
 */

function formatInputApiGateway(event : any, context : any, state : any){
    return {
        params: event.pathParameters,
        headers: event.headers,
        method: event.httpMethod,
        path: event.path,
        body: typeof event.body === 'string' ? 
                JSON.parse(event.body) : event.body,
        event,
        context,
        state,
    }
}

/*******
 * Create format for output API GATEWAY
 */
 function formatOutputApiGateway(output : any){
    return {
        statusCode: output.code,
        body: JSON.stringify(output.body),
        headers: output.headers,
        multiValueHeaders: output.multiValueHeaders,
        isBase64Encoded: output.isBase64Encoded
    }
}