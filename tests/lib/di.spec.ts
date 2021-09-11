import { Container, ContainerModule, interfaces, inject } from 'inversify';
import 'reflect-metadata';
import {DependencyContainer, Inject, Injectable} from '../../src/lib/internal';

jest.setTimeout(1000 * 10);

describe('Test DI', () => {

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
        instance.execute();
        const container = instance.container;
        const value = container.get(ServiceC);
        await instance.resolver.resolve();

        expect(value.far()).toBe(0);
    });

    test('Should resolve packages', async () => {
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
                [
                    [
                        ServiceC
                    ],
                    [
                        ServiceA
                    ],
                ]
            ]
        );
        instance.execute();
        const container = instance.container;
        const value = container.get(ServiceC);
        await instance.resolver.resolve();

        expect(value.far()).toBe(0);
    });

});