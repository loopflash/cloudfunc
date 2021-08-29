import { 
    AwsProvider, 
    ValidatorException, 
    DependencyElement 
} from "./internal";

export enum Provider{
    AWS,
    GOOGLE,
}

export namespace ProviderCompany{
    export type Aws = Provider.AWS;
    export type Google = Provider.GOOGLE;
}

export type ProviderSelector<T> = T extends ProviderCompany.Aws
    ? AwsProvider
    : AwsProvider;
export type Providers = ProviderCompany.Aws | ProviderCompany.Google;

export function Container<T extends Provider = Provider.AWS>(
    provider? : T
) : ProviderSelector<T>{
    if(provider === Provider.AWS){
        return new AwsProvider();
    }
    if(provider === Provider.GOOGLE){
        return new AwsProvider();
    }
    throw new Error();
}

export abstract class ContainerExecutor{
    public _event : any;
    public _aditionalEvent : any;
    public _validatorSchema : IValidatorSchema[];
    public _dependencyList : DependencyElement[];
    public _entryPoint : any;
    public _interceptor : IInterceptor<any>;

    transform(event : any) : any{
        return event;
    };

    protected async executeValidator(event : any) : Promise<void>{
        const listValidators = this._validatorSchema.map((value) => {
            return value.validate(event);
        });
        await Promise.all(listValidators);
    };
}

export abstract class ContainerProcess extends ContainerExecutor{

    private async process() : Promise<any>{
        try{
            const event = this.transform(this._event);
            await this.executeValidator(
                event
            );
        }catch(e : any){

        }
    }

    async execute(){
        return await this.process();
    }

}

export abstract class ContainerBase extends ContainerProcess{

    addValidator(
        validatorSchema : IValidatorSchema,
    ){
        this._validatorSchema.push(validatorSchema);
    }

    addContext(
        event : any,
        aditional : any[]
    ){
        this._event = event;
        this._aditionalEvent = aditional;
    }

    addEntryPoint(entry : any){
        this._entryPoint = entry;
    }

}

/***********
 * Validator Schema Code
 */

export interface IValidatorSchema{
    validate(event : any) : Promise<void>;
}

/***********
 * Interceptor Code
 */

export interface IInterceptor<T>{
    intercept(error : any) : Promise<T>;
}

export type Guard<T> = {
    pass: boolean,
    data: T
}