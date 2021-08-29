import {DependencyContainer} from '../../src/lib/internal';

describe('Test Container', () => {

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

});