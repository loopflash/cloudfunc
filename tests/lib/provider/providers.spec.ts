/**
 * @group unit/raw-lambda
 */
import 'reflect-metadata';
import {AwsProvider} from '../../../src/lib/provider/providers';

 describe('Provider AWS - Raw Lambda', () => {
 
     let instance : AwsProvider;
 
     beforeEach(() => {
         instance = new AwsProvider();
         instance.setContainer({} as any);
     });
     
     test('Should format input for AWS provider in simple way', async () => {
         const event = {request: null};
         const context = {function: null};
         instance.setArgs([event, context]);
         const out = await instance.beforeEntry([], {
            entryReference: {
                prototype: {}
            }
         } as any);
         expect(out).toBeDefined();
         expect(out[0]).toBeDefined();
         expect(out[0]).toBe(event);
         expect(out[1]).toBeDefined();
         expect(out[1]).toBe(context);
     });
 
     test('Should format output for AWS provider in simple way', async () => {
         const event = {request: null};
         const context = {function: null};
         const payload = {body: null};
         instance.setArgs([event, context]);
         const out = await instance.afterEntry(payload, [], {
            entryReference: {
                prototype: {}
            }
         } as any);
         expect(out).toBeDefined();
         expect(out).toBe(payload);
     });
 
 });