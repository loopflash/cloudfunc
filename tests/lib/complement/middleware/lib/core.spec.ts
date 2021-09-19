import { executeMiddleware, MiddlewareClass, MiddlewareObject, IMiddleware, MiddlewareEvent } from "../../../../../src/lib/internal"

describe('Test Middleware', () => {

    let fakeMiddleware : MiddlewareClass;
    let fakeMiddleware2 : MiddlewareClass;

    beforeEach(() => {
        fakeMiddleware = class implements IMiddleware{

            async onCall(event: MiddlewareEvent, options?: any): Promise<void> {
                event.aws.event.flag = true;
                options.flag = true;
            }

        }

        fakeMiddleware2 = class implements IMiddleware{

            async onCall(event: MiddlewareEvent, options?: any): Promise<void> {
                event.aws.event.flag = true;
                options.flag = true;
            }

        }
    });

    test('Should execute flow with empty array of middlewares', async () => {
        const event = {};
        const middlewares = [];
        const container = null;
        await expect(
            executeMiddleware(event, middlewares, container)
        ).resolves.not.toThrow();
    });

    test('Should execute flow with some neutral classes', async () => {
        const event : MiddlewareEvent = {
            aws: {
                context: {},
                event: {}
            }
        };
        const middlewares : MiddlewareObject[] = [
            fakeMiddleware
        ];
        const container = {
            isBound: jest.fn().mockReturnValue(false)
        };
        await expect(
            executeMiddleware(event, middlewares, container as any)
        ).resolves.not.toThrow();
        expect(event).toHaveProperty('aws.event.flag', true)
    });

    test('Should execute flow with some injectable classes', async () => {
        const event : MiddlewareEvent = {
            aws: {
                context: {},
                event: {}
            }
        };
        const middlewares : MiddlewareObject[] = [
            fakeMiddleware
        ];
        const container = {
            isBound: jest.fn().mockReturnValue(true),
            get: jest.fn().mockReturnValue(new fakeMiddleware())
        };
        await expect(
            executeMiddleware(event, middlewares, container as any)
        ).resolves.not.toThrow();
        expect(event).toHaveProperty('aws.event.flag', true)
    });

    test('Should execute flow with some neutral classes and options', async () => {
        const event : MiddlewareEvent = {
            aws: {
                context: {},
                event: {}
            }
        };
        const options = {};
        const middlewares : MiddlewareObject[] = [
            {
                middleware: fakeMiddleware,
                options
            }
        ];
        const container = {
            isBound: jest.fn().mockReturnValue(false)
        };
        await expect(
            executeMiddleware(event, middlewares, container as any)
        ).resolves.not.toThrow();
        expect(event).toHaveProperty('aws.event.flag', true);
        expect(options).toHaveProperty('flag', true);
    });

    test('Should execute flow with two neutral classes and options', async () => {
        const event : MiddlewareEvent = {
            aws: {
                context: {},
                event: {}
            }
        };
        const options = [{}, {}];
        const middlewares : MiddlewareObject[] = [
            {
                middleware: fakeMiddleware,
                options: options[0]
            },
            {
                middleware: fakeMiddleware2,
                options: options[1]
            }
        ];
        const container = {
            isBound: jest.fn().mockReturnValue(false)
        };
        await expect(
            executeMiddleware(event, middlewares, container as any)
        ).resolves.not.toThrow();
        expect(options[0]).toHaveProperty('flag', true);
        expect(options[1]).toHaveProperty('flag', true);
    });

});