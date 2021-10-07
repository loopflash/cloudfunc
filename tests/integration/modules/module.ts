import {
    Package,
    IPackage,
    PackageObject
} from '../../../src';
import { Service1 } from './services/service1';
import { Service2 } from './services/service2';

@Package()
export class MyPackage implements IPackage{

    onPackage(): PackageObject {
        return {
            packages: [],
            services: [
                Service1,
                {
                    bind: 'myService',
                    scope: 'local',
                    to: Service2
                }
            ]
        }
    }


}