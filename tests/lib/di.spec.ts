/**
 * @group unit/di
 */
import 'reflect-metadata';
import {DependencyContainer, Package, Inject, Injectable, Local, IPackage, PackageObject, PackageStaticObject} from '../../src/lib/internal';

jest.setTimeout(1000 * 10);

describe('Test DI', () => {

    test('Should resolve activations', async () => {
        @Injectable()
        class ServiceA{

            initial = 1;

            async onActivation(){
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(null);
                    }, 100);
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
                        this._service.initial++;
                        resolve(null);
                    }, 100);
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
                        this._service._service.initial = 0;
                        resolve(null);
                    }, 100);
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
        class PackageE implements IPackage{
            
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
        class PackageA implements IPackage{
            
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
        class PackageB implements IPackage{
            
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
        instance.execute()
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
                @Inject('A') @Local() private _value : number
            ){}

            get value(){
                return this._value;
            }
        }

        @Package()
        class PackageC implements IPackage{

            onPackage(): PackageObject {
                return {
                    packages: [],
                    services: [
                        ServiceC1,
                        {
                            bind: 'A',
                            scope: 'local',
                            to: 50
                        }
                    ]
                }
            }

        }

        @Package()
        class PackageA implements IPackage{
            
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
                @Inject('A') @Local() private _value : number
            ){}

            get value(){
                return this._value;
            }
        }

        @Package()
        class PackageB implements IPackage{
            
            onPackage() : PackageObject{
                return {
                    packages: [
                        PackageA
                    ],
                    services: [
                        ServiceB1,
                        {
                            bind: 'A',
                            scope: 'local',
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
        const mainService = instance.container.get(ServiceC1);
        expect(mainService.value).toBe(50);
    });

    test('Should resolve static packages', () => {

        @Injectable()
        class ServiceC1{

            constructor(
                @Inject('A') @Local() private _value : number
            ){}

            get value(){
                return this._value;
            }
        }

        @Package()
        class PackageA{
            
            static onPackage(val : number) : PackageStaticObject{
                return {
                    context: PackageA,
                    packages: [],
                    services: [
                        ServiceC1,
                        {
                            bind: 'A',
                            scope: 'local',
                            to: val
                        }
                    ]
                }
            }

        }

        @Injectable()
        class ServiceB1{

            constructor(
                @Inject('A') @Local() private _value : number
            ){}

            get value(){
                return this._value;
            }
        }

        @Package()
        class PackageB implements IPackage{
            
            onPackage() : PackageObject{
                return {
                    packages: [
                        PackageA.onPackage(50)
                    ],
                    services: [
                        ServiceB1,
                        {
                            bind: 'A',
                            scope: 'local',
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
        const mainService = instance.container.get(ServiceC1);
        expect(mainService.value).toBe(50);
    });

});