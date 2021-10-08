import {
    Injectable,
    IEntryPoint
} from '../../../src';

@Injectable()
export class EntryPoint implements IEntryPoint{

    async entry(...args: any[]): Promise<any> {
        return {
            status: 200
        }
    }

}