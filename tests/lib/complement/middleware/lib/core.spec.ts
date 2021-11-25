/**
 * @group unit/middleware/core
 */
import { executeMiddleware, MiddlewareObject, MiddlewareOrder } from "../../../../../src/lib/internal"

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
        await expect(
            executeMiddleware(args, middlewares, container)
        ).resolves.not.toThrow();
    });

    test('Should execute flow with function in list', async () => {
        const event = {};
        const context = {};
        const args = [event, context];
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
            executeMiddleware(args, middlewares, null as any)
        ).resolves.not.toThrow();
        expect(fakeMiddleware).toBeCalled();
        expect(fakeMiddleware2).toBeCalled();
    });

    test('Should execute flow with some injectable classes', async () => {
        const event = {};
        const context = {};
        const params = {};
        const args = [event, context];
        const middlewares : MiddlewareObject[] = [
            {
                executor: fakeMiddleware,
                order: MiddlewareOrder.INPUT,
                params,
                service: null
            }
        ];
        const container = {
            isBound: jest.fn().mockReturnValue(true),
            get: jest.fn().mockReturnValue({
                myservice: 100
            })
        };
        await expect(
            executeMiddleware(args, middlewares, container as any)
        ).resolves.not.toThrow();
        expect(fakeMiddleware).toHaveBeenCalledWith(params, event, context);
    });

});