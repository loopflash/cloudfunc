import {
    Injectable,
    IActivation
} from '../../../../src';

@Injectable()
export class Service3 implements IActivation{

    value : number = 0;

    async onActivation(): Promise<void> {
        await new Promise((resolve) => {
            setTimeout(() => {
                this.value = 500;
                resolve(null);
            }, 1000);
        });
    }

}