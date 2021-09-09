import 'reflect-metadata';
import {DependencyContainer, Inject, Injectable} from '../../src/lib/internal';

jest.setTimeout(1000 * 10);

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

    test('Should resolve activations', async () => {
        @Injectable()
        class ServiceA{

            initial = 1;

            async onActivation(){
                await new Promise((resolve) => {
                    setTimeout(() => {
                        console.log("timeout 3000")
                        resolve(null);
                    }, 3000);
                });
            }

            far(){
                return 5;
            }
        }

        @Injectable()
        class ServiceB{
            constructor(
                public _service : ServiceA
            ){}

            async onActivation(){
                await new Promise((resolve) => {
                    setTimeout(() => {
                        console.log("timeout 1000-2")
                        this._service.initial++;
                        resolve(null);
                    }, 1000);
                });
            }

            bar(){
                return this._service.far();
            }
        }

        @Injectable()
        class ServiceC{
            constructor(
                private _service : ServiceB
            ){}

            async onActivation(){
                await new Promise((resolve) => {
                    setTimeout(() => {
                        console.log("timeout 1000-1")
                        this._service._service.initial = 0;
                        resolve(null);
                    }, 1000);
                });
            }

            far(){
                return this._service._service.initial;
            }
        }

        const instance = DependencyContainer.makeContainer(
            [
                ServiceB,
                ServiceA,
                ServiceC
            ]
        );
        await instance.execute();
        const container = instance.container;
        const value = container.get(ServiceC);
        await instance.resolver.resolve();

        expect(value.far()).toBe(0);
    });

    test('Should insert metadata in decorator of @Injectable', () => {
        const anonClass = class{};
        Injectable()(anonClass);
        expect(
            Reflect.hasMetadata('proto:id', anonClass)
        ).toBe(true);
    });

});