/**
 * @group integration/basic-services
 */
import 'reflect-metadata';
import {
    Container,
    AwsProvider
} from '../../../src';
import { EntryPoint } from './entry';
import { myMiddleware } from './services/middleware';

describe('Integration - Decorators', () => {

    test('Should return status 200', async () => {
        const container = new Container();
        const entry = {doc: 10} as any;
        container.addEntryPoint(EntryPoint);
        await container.load();
        const provider = new AwsProvider();
        provider.setArgs([entry, {}]);
        const result = await container.execute(provider);
        expect(result).toBeDefined();
        expect(result.event).toBe(entry);
        expect(result.context).toMatchObject({});
        expect(result.far).toBe(100);
        expect(result.bar).toBe(1000);
    });

});