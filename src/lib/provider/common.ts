import { IValidator, ValidatorObject } from '../internal';

export abstract class CommonSpec{
    private _validator : ValidatorObject[] = [];

    addValidator(validator : IValidator, reference : string){
        this._validator.push({
            validator,
            reference
        });
    }

    get validator(){
        return this._validator;
    }
}

export abstract class Provider extends CommonSpec{
    abstract beforeEntry() : Promise<any[]>;
    abstract afterEntry(...args : any[]) : Promise<any>;
}