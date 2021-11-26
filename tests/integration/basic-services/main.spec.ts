/**
 * @group integration/basic-services
 */
import 'reflect-metadata';
import {
    Container,
    AwsProvider
} from '../../../src';
import { EntryPoint } from './entry';
import { Service1 } from './services/service1';
import { Service2 } from './services/service2';

describe('Integration - Basic Services', () => {

    test('Should return status 200', async () => {
        const container = new Container();
        container.addEntryPoint(EntryPoint);
        container.addServices([
            Service1,
            Service2
        ]);
        await container.load();
        const provider = new AwsProvider();
        provider.setArgs([{}, {}]);
        const result = await container.execute(provider);
        expect(result.status).toBeDefined();
        expect(result.status).toBe(200);
    })

});