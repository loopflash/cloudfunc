import { IValidator, ValidatorObject, Provider } from '../../../internal';

export abstract class AwsProvider extends Provider{

    protected _event : any = {};
    protected _context : any = {};
    protected _validator : ValidatorObject[] = [];

    setEvent(event : any){
        this._event = event;
    };

    setContext(context : any){
        this._context = context;
    };

    addValidator(validator : IValidator, reference : string){
        this._validator.push({
            validator,
            reference
        });
    }

}