import 'reflect-metadata';
import {DependencyContainer, Injectable} from '../../src/lib/internal';

describe('Test DI', () => {

    test('Should return dependencies in order', async () => {
        const instance = DependencyContainer.makeContainer(
            [
                {
                    bind: 'a',
                    to: 1
                },
                {
                    bind: 'd',
                    factory: async () => {},
                    factoryDeps: ['c']
                },
                {
                    bind: 'b',
                    to: 1
                },
                {
                    bind: 'c',
                    factory: async () => {},
                    factoryDeps: ['a']
                },
                {
                    bind: 'e',
                    factory: async () => {
                        return () => {}
                    },
                    factoryDeps: ['d']
                },
            ]
        );
        await instance.execute();
        const nodes = instance.graph.overallOrder();
        expect(nodes).toStrictEqual([ 'b', 'a', 'c', 'd', 'e' ])
    });

    test('Should insert metadata in decorator of @Injectable', () => {
        const anonClass = class{};
        Injectable()(anonClass);
        expect(
            Reflect.hasMetadata('proto:id', anonClass)
        ).toBe(true);
    });

});