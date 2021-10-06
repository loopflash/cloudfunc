/**
 * @group integration/basic-services
 */
import 'reflect-metadata';
import {
    Container,
    AwsRawLambda
} from '../../../src';
import { EntryPoint } from './entry';
import { Service1 } from './services/service1';
import { Service2 } from './services/service2';
import { Service3 } from './services/service3';

describe('Integration - Basic Services', () => {

    test('Should return status 200', async () => {
        const container = new Container();
        container.addEntryPoint(EntryPoint);
        container.addServices([
            Service1,
            {
                bind: 'myService',
                to: Service2
            },
            Service3
        ]);
        await container.load();
        const provider = new AwsRawLambda();
        provider.setEvent({});
        provider.setContext({});
        const result = await container.execute(provider);
        expect(result.status).toBeDefined();
        expect(result.status).toBe(700);
    })

});