import {Injectable, IActivation, IEntryPoint} from '../../src/lib/internal';

@Injectable()
export class Service1 implements IActivation{

    value : Date;

    async onActivation(): Promise<void> {
        await new Promise((res) => {
            setTimeout(() => {
                this.value = new Date();
                res(null);
            }, 100);
        });
    }

}

@Injectable()
export class Service2 implements IActivation{

    value : Date;

    constructor(
        private _service : Service1
    ){}

    async onActivation(): Promise<void> {
        await new Promise((res) => {
            setTimeout(() => {
                this.value = new Date();
                res(null);
            }, 100);
        });
    }

}

@Injectable()
export class Service3 implements IActivation{

    value : Date;

    constructor(
        private _service : Service2
    ){}

    async onActivation(): Promise<void> {
        await new Promise((res) => {
            setTimeout(() => {
                this.value = new Date();
                res(null);
            }, 100);
        });
    }

}

@Injectable()
export class EntryMain implements IEntryPoint{

    constructor(
        private _service : Service3
    ){}
        
    async entry(...args: any[]): Promise<any> {
       return {};
    }

}