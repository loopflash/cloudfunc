<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [cloudfunc](./cloudfunc.md)

## cloudfunc package

## Classes

|  Class | Description |
|  --- | --- |
|  [AwsProvider](./cloudfunc.awsprovider.md) |  |
|  [AzureProvider](./cloudfunc.azureprovider.md) |  |
|  [Container](./cloudfunc.container.md) |  |
|  [ContainerProcess](./cloudfunc.containerprocess.md) |  |
|  [CustomProvider](./cloudfunc.customprovider.md) |  |
|  [DependencyContainer](./cloudfunc.dependencycontainer.md) |  |
|  [GcpProvider](./cloudfunc.gcpprovider.md) |  |
|  [Provider](./cloudfunc.provider.md) |  |
|  [ProviderBase](./cloudfunc.providerbase.md) |  |
|  [ResolverDependency](./cloudfunc.resolverdependency.md) |  |

## Enumerations

|  Enumeration | Description |
|  --- | --- |
|  [MiddlewareOrder](./cloudfunc.middlewareorder.md) |  |

## Functions

|  Function | Description |
|  --- | --- |
|  [createDecorator(key)](./cloudfunc.createdecorator.md) | Create a decorator to be used at the entry point |
|  [executeMiddleware(args, middlewares, container, provider)](./cloudfunc.executemiddleware.md) |  |
|  [getDecorators(entryPoint)](./cloudfunc.getdecorators.md) |  |
|  [getMiddlewares(entryPoint)](./cloudfunc.getmiddlewares.md) |  |
|  [Inject(key)](./cloudfunc.inject.md) | Inject a service for his utilization |
|  [Injectable()](./cloudfunc.injectable.md) | Make a service injectable for application |
|  [isClass(func)](./cloudfunc.isclass.md) |  |
|  [Local()](./cloudfunc.local.md) | Inject a service for his utilization but with a context inside his module |
|  [Middleware(fn, order)](./cloudfunc.middleware.md) | Add middleware to entry point |
|  [Optional()](./cloudfunc.optional.md) | Set an injection with optionable option |
|  [Package()](./cloudfunc.package.md) | Make a module |

## Interfaces

|  Interface | Description |
|  --- | --- |
|  [IActivation](./cloudfunc.iactivation.md) |  |
|  [IEntryPoint](./cloudfunc.ientrypoint.md) |  |
|  [IInterceptor](./cloudfunc.iinterceptor.md) |  |
|  [IPackage](./cloudfunc.ipackage.md) |  |

## Variables

|  Variable | Description |
|  --- | --- |
|  [metadataKeyArgsDecorator](./cloudfunc.metadatakeyargsdecorator.md) |  |
|  [metadataKeyMiddleware](./cloudfunc.metadatakeymiddleware.md) |  |

## Type Aliases

|  Type Alias | Description |
|  --- | --- |
|  [ActivationClassHandler](./cloudfunc.activationclasshandler.md) |  |
|  [BindType](./cloudfunc.bindtype.md) |  |
|  [DependencyElement](./cloudfunc.dependencyelement.md) |  |
|  [DependencyElementObject](./cloudfunc.dependencyelementobject.md) |  |
|  [DependencyModule](./cloudfunc.dependencymodule.md) |  |
|  [EntryPointClass](./cloudfunc.entrypointclass.md) | Class definition implements [IEntryPoint](./cloudfunc.ientrypoint.md) |
|  [Interceptor](./cloudfunc.interceptor.md) | Class definition implements [IInterceptor](./cloudfunc.iinterceptor.md) |
|  [MiddlewareDynamic](./cloudfunc.middlewaredynamic.md) |  |
|  [MiddlewareExecutor](./cloudfunc.middlewareexecutor.md) |  |
|  [MiddlewareObject](./cloudfunc.middlewareobject.md) |  |
|  [MiddlewareParam](./cloudfunc.middlewareparam.md) |  |
|  [MiddlewareParams](./cloudfunc.middlewareparams.md) |  |
|  [ModuleImport](./cloudfunc.moduleimport.md) |  |
|  [PackageObject](./cloudfunc.packageobject.md) |  |
|  [PackageStaticObject](./cloudfunc.packagestaticobject.md) |  |
|  [ProcessInfo](./cloudfunc.processinfo.md) | Process Info definition |
|  [Providers](./cloudfunc.providers.md) |  |
|  [ResolverDependencyActivation](./cloudfunc.resolverdependencyactivation.md) |  |

