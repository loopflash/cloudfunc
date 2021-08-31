import 'reflect-metadata';
import {DependencyContainer, Inject, Injectable} from '../../src/lib/internal';

describe('Test DI', () => {

    test('Should order dependencies', async () => {
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

    test('Should resolve dependencies', async () => {
        const instance = DependencyContainer.makeContainer(
            [
                {
                    bind: 'a',
                    to: 1
                },
                {
                    bind: 'b',
                    to: 1
                },
                {
                    bind: 'c',
                    factory: async (arg1, arg2) => {
                        return arg1 + arg2;
                    },
                    factoryDeps: ['a', 'b']
                },
                {
                    bind: 'd',
                    factory: async (arg1) => {
                        return () => arg1;
                    },
                    factoryDeps: ['c']
                },
            ]
        );
        await instance.execute();
        const container = instance.container;
        const value = container.get('d') as () => any
        expect(typeof value).toBe('function');
        const result = value();
        expect(result).toBe(2);
    });

    test('Should resolve nested dependencies', async () => {
        @Injectable()
        class ServiceA{
            far(){
                return 5;
            }
        }

        @Injectable()
        class ServiceB{
            constructor(
                private _service : ServiceA
            ){}

            bar(){
                return this._service.far();
            }
        }
        const instance = DependencyContainer.makeContainer(
            [
                ServiceB,
                ServiceA,
                {
                    bind: 'c',
                    factory: async (arg1 : ServiceB) => {
                        return arg1.bar();
                    },
                    factoryDeps: [ServiceB]
                }
            ]
        );
        await instance.execute();
        const container = instance.container;
        const value = container.get('c')
        expect(value).toBe(5);
    });

    test('Should insert metadata in decorator of @Injectable', () => {
        const anonClass = class{};
        Injectable()(anonClass);
        expect(
            Reflect.hasMetadata('proto:id', anonClass)
        ).toBe(true);
    });

});