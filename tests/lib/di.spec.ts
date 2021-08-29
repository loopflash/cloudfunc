import 'reflect-metadata';
import {DependencyContainer, Injectable} from '../../src/lib/internal';

describe('Test DI', () => {

    test('Should return dependencies in order', () => {
        const instance = DependencyContainer.makeContainer(
            [
                {
                    bind: 'a',
                    to: 1
                },
                {
                    bind: 'd',
                    factoryDeps: [
                        'c'
                    ]
                },
                {
                    bind: 'b',
                    to: 2
                },
                {
                    bind: 'c',
                    factoryDeps: [
                        'a'
                    ]
                },
                {
                    bind: 'e',
                    factoryDeps: [
                        'd'
                    ]
                },
            ]
        );
        instance.execute();
        const nodes = instance.graph.overallOrder();
        expect(nodes).toStrictEqual([ 'b', 'a', 'c', 'd', 'e' ])
    });

    test('Should insert metadata in decorator of @Injectable', () => {
        const anonClass = class{};
        Injectable()(anonClass);
        expect(
            Reflect.hasMetadata('proto:id', anonClass)
        ).toBe(true);
        expect(
            Reflect.hasMetadata('proto:scope', anonClass)
        ).toBe(true)
    });

});