/**
 * @group unit/raw-lambda
 */
import 'reflect-metadata';
import { IEntryPoint } from '../../../src/lib/internal';
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
         let fn = class implements IEntryPoint{
            
            entry(...args: any[]): Promise<any> {
                return;
            }
            
        }
         instance.setArgs([event, context]);
         const out = await instance.beforeEntry([], {
            entry: fn
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
         let fn = class implements IEntryPoint{
            
            entry(...args: any[]): Promise<any> {
                return;
            }
            
        }
         instance.setArgs([event, context]);
         const out = await instance.afterEntry(payload, [], {
            entry: fn
         } as any);
         expect(out).toBeDefined();
         expect(out).toBe(payload);
     });
 
 });