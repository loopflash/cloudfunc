import { pick } from 'dot-object';

export interface IValidator{
    validate(event : any) : Promise<void>;
}

export type ValidatorObject = {
    validator: IValidator,
    reference: string
}

export async function executeValidator(
    event : any,
    validators : ValidatorObject[]
) : Promise<void>{
    for(const item of validators){
        const select = pick(item.reference, event);
        await item.validator.validate(select);
    }
};