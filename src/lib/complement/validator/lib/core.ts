import { pick } from 'dot-object';

export interface IValidator{
    onCall(event : any) : Promise<void>;
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
        await item.validator.onCall(select);
    }
};