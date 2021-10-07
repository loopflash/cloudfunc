/**
 * @group integration/basic-services
 */
import 'reflect-metadata';
import {
    Container,
    AwsRawLambda
} from '../../../src';
import { EntryPoint } from './entry';
import { Interceptor } from './interceptor';
import { Service1 } from './services/service1';
import { Service2 } from './services/service2';

describe('Integration - Interceptor', () => {

    test('Should return status 200', async () => {
        const container = new Container();
        container.addEntryPoint(EntryPoint);
        container.addServices([
            Service1,
            Service2
        ]);
        container.addInterceptor(Interceptor);
        await container.load();
        const provider = new AwsRawLambda();
        provider.setEvent({});
        provider.setContext({});
        const result = await container.execute(provider);
        expect(result.status).toBeDefined();
        expect(result.status).toBe(200);
    })

});