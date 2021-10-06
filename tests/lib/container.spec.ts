/**
 * @group unit/container
 */
import 'reflect-metadata';
import {Container} from '../../src/lib/internal';
import {EntryMain, Service1, Service2, Service3} from '../__test__/container';

describe('Test Container', () => {

    let container : Container;

    beforeEach(() => {
        container = new Container();
    });

    test('Should resolve dependencies in order', async () => {
        container.addServices([
            Service1,
            Service2,
            Service3
        ]);
        container.addEntryPoint(EntryMain);
        await container.load();
        const getService1 = container.container.get(Service1);
        const getService2 = container.container.get(Service2);
        const getService3 = container.container.get(Service3);
        expect(
            getService1.value <= getService2.value && getService2.value <= getService3.value
        ).toBe(true);
    })

});