/**
 * @group unit/middleware/core
 */
import 'reflect-metadata';
import { createDecorator, executeMiddleware, getDecorators, MiddlewareObject, MiddlewareOrder, ProviderInfo } from "../../../../../src/lib/internal"

describe('Test Middleware', () => {

    let fakeMiddleware : jest.Mock;
    let fakeMiddleware2 : jest.Mock;

    beforeEach(() => {
        fakeMiddleware = jest.fn();
        fakeMiddleware2 = jest.fn();
    });

    test('Should execute flow with empty array of middlewares', async () => {
        const event = {};
        const context = {};
        const args = [event, context];
        const middlewares = [];
        const container = null;
        const provider = {provider: 'aws'} as ProviderInfo
        await expect(
            executeMiddleware(args, middlewares, container, provider)
        ).resolves.not.toThrow();
    });

    test('Should execute flow with function in list', async () => {
        const event = {};
        const context = {};
        const args = [event, context];
        const provider = {provider: 'aws'} as ProviderInfo
        const middlewares : MiddlewareObject[] = [
            {
                executor: fakeMiddleware,
                order: MiddlewareOrder.INPUT,
                params: {},
                service: null
            },
            {
                executor: fakeMiddleware2,
                order: MiddlewareOrder.INPUT,
                params: {},
                service: null
            }
        ];
        await expect(
            executeMiddleware(args, middlewares, null as any, provider)
        ).resolves.not.toThrow();
        expect(fakeMiddleware).toBeCalled();
        expect(fakeMiddleware2).toBeCalled();
    });

    test('Should execute flow with some injectable classes', async () => {
        const event = {};
        const context = {};
        const params = {};
        const args = [event, context];
        const serv = {
            myservice: 100
        } as any;
        const middelware = jest.fn().mockImplementation(function(service){
            expect(service.myservice).toBeDefined();
            expect(service.myservice).toBe(100);
        });
        const middlewares : MiddlewareObject[] = [
            {
                executor: middelware,
                order: MiddlewareOrder.INPUT,
                params,
                service: serv
            }
        ];
        const container = {
            isBound: jest.fn().mockReturnValue(true),
            get: jest.fn().mockImplementation(obj => obj)
        };
        const provider = {provider: 'aws'} as ProviderInfo
        await expect(
            executeMiddleware(args, middlewares, container as any, provider)
        ).resolves.not.toThrow();
        expect(middelware).toHaveBeenCalledWith(serv, {
            ...params,
            ...provider
        }, event, context);
    });

    describe('Decorator Middleware Scope', () => {

        let fn = {
            prototype: {
                entry: function(){}
            }
        };

        beforeEach(() => {
            const Getting = createDecorator('getting');
            Getting(fn.prototype, 'entry', 0);
        });

        test('Should get params decorators', () => {
            const decorators = getDecorators(fn);
            expect(decorators).toHaveLength(1);
            expect(decorators[0]).toBe('getting');
        });

    })

});