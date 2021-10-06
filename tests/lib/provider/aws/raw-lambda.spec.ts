/**
 * @group unit/raw-lambda
 */
import {AwsRawLambda} from '../../../../src/lib/provider/aws/raw-lambda';

describe('Provider AWS - Raw Lambda', () => {

    let instance : AwsRawLambda;

    beforeEach(() => {
        instance = new AwsRawLambda();
        instance.setContainer({} as any);
    });
    
    test('Should format input for AWS provider in simple way', async () => {
        const event = {request: null};
        const context = {function: null};
        instance.setEvent(event);
        instance.setContext(context);
        const out = await instance.beforeEntry();
        expect(out[0]).toBeDefined();
        expect(out[0].event).toBeDefined();
        expect(out[0].event).toBe(event);
        expect(out[0].context).toBeDefined();
        expect(out[0].context).toBe(context);
        expect(out[0].state).toBeDefined();
    });

    test('Should format output for AWS provider in simple way', async () => {
        const event = {request: null};
        const context = {function: null};
        const payload = {body: null};
        instance.setEvent(event);
        instance.setContext(context);
        const out = await instance.afterEntry(payload);
        expect(out).toBeDefined();
        expect(out).toBe(payload);
    });

});