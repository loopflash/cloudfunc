/**
 * @group integration/modules
 */
import 'reflect-metadata';
import {
    Container,
    AwsRawLambda
} from '../../../src';
import { EntryPoint } from './entry';
import { MyPackage } from './module';
import { Service3 } from './services/service3';

describe('Integration - Module', () => {

    test('Should return status 700', async () => {
        const container = new Container();
        container.addEntryPoint(EntryPoint);
        container.addModules([
            MyPackage
        ]);
        container.addServices([
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