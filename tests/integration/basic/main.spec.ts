/**
 * @group integration/basic
 */
import 'reflect-metadata';
import {
    Container,
    AwsRawLambda
} from '../../../src';
import { EntryPoint } from './entry';

describe('Integration - Basic', () => {

    test('Should return status 200', async () => {
        const container = new Container();
        container.addEntryPoint(EntryPoint);
        await container.load();
        const provider = new AwsRawLambda();
        provider.setEvent({});
        provider.setContext({});
        const result = await container.execute(provider);
        expect(result.status).toBeDefined();
        expect(result.status).toBe(200);
    })

});