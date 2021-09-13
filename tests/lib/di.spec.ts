import { Container, ContainerModule, interfaces, inject } from 'inversify';
import 'reflect-metadata';
import {DependencyContainer, Package, Inject, Injectable} from '../../src/lib/internal';

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
            ],
            []
        );
        instance.execute();
        const container = instance.container;
        const value = container.get(ServiceC);
        await instance.resolver.resolve();

        expect(value.far()).toBe(0);
    });

    test('Should order dependencies', () => {

        @Package()
        class PackageE{
            
            onPackage(){
                return {
                    packages: [],
                    services: []
                }
            }

        }

        @Package()
        class PackageC{
            
            onPackage(){
                return {
                    packages: [],
                    services: []
                }
            }

        }

        @Package()
        class PackageD{
            
            onPackage(){
                return {
                    packages: [
                        PackageE
                    ],
                    services: []
                }
            }

        }

        @Package()
        class PackageA{
            
            onPackage(){
                return {
                    packages: [
                        PackageC,
                        PackageD
                    ],
                    services: []
                }
            }

        }

        @Package()
        class PackageB{
            
            onPackage(){
                return {
                    packages: [
                        PackageA
                    ],
                    services: []
                }
            }

        }

        const instance = DependencyContainer.makeContainer(
            [],
            [
                PackageB
            ]
        );
        instance.resolvePackages();
        const v = instance.graph;
        const or = v.overallOrder();
        expect(or[or.length - 1]).toBe(
            Reflect.getMetadata('package:id', PackageB)
        )
    });

    test('Should resolve packages', () => {
        
        @Injectable()
        class ServiceC1{

            constructor(
                @Inject('A') private _value : number
            ){}

            get value(){
                return this._value;
            }
        }

        @Package()
        class PackageC{
            
            onPackage(){
                return {
                    packages: [],
                    services: [
                        ServiceC1,
                        {
                            bind: 'A',
                            to: 50
                        }
                    ]
                }
            }

        }

        @Package()
        class PackageA{
            
            onPackage(){
                return {
                    packages: [
                        PackageC,
                    ],
                    services: []
                }
            }

        }

        @Injectable()
        class ServiceB1{

            constructor(
                @Inject('B') private _value : number
            ){}

            get value(){
                return this._value;
            }
        }

        @Package()
        class PackageB{
            
            onPackage(){
                return {
                    packages: [
                        PackageA
                    ],
                    services: [
                        ServiceB1,
                        {
                            bind: 'B',
                            to: 120
                        }
                    ]
                }
            }

        }

        @Injectable()
        class ServiceMain{

            constructor(
                private _ss : ServiceB1
            ){}

            get value(){
                return this._ss.value;
            }
        }

        const instance = DependencyContainer.makeContainer(
            [
                ServiceMain
            ],
            [
                PackageB
            ]
        );
        instance.execute();
        const mainService = instance.container.get(ServiceMain);
        console.log(instance.container, mainService)

    //     // const mainService = instance.container.get(ServiceMain);
    //     // console.log(mainService.value)
    //     // const serviceC = instance.container.get(ServiceC1);
    //     // const serviceB = instance.container.get(ServiceB1);
    //     // const vv = instance.container.parent.parent;
    //     // console.log((instance.container as any)._bindingDictionary._map, serviceB)
    //     // console.log((vv as any)._bindingDictionary._map, serviceB)
    //     // expect(serviceC.value).toBe(50);
    //     // expect(serviceB.value).toBe(100);
    });

    test('ttt', () => {
        const container = new Container();
        //container.bind('A').toConstantValue(10);
        const childContainer = container.createChild();
        childContainer.bind('A').toConstantValue(20);
        console.log(container.get('A'))
    })

});