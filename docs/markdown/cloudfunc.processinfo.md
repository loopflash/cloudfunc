<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [cloudfunc](./cloudfunc.md) &gt; [ProcessInfo](./cloudfunc.processinfo.md)

## ProcessInfo type

Process Info definition

<b>Signature:</b>

```typescript
export declare type ProcessInfo = {
    provider: string;
    finish: {
        response: any;
        flag: boolean;
    };
    decoratorValues: {
        [key: string | symbol]: any;
    };
    entry: EntryPointClass;
};
```
<b>References:</b> [EntryPointClass](./cloudfunc.entrypointclass.md)

