import { Provider, Providers } from '../internal';

/** @public */
export abstract class AwsProvider extends Provider{

    override _provider = 'aws' as Providers;

    constructor(){
        super();
    }

}

/** @public */
export abstract class GcpProvider extends Provider{

    override _provider = 'gcp' as Providers;

    constructor(){
        super();
    }

}

/** @public */
export abstract class AzureProvider extends Provider{

    override _provider = 'azure' as Providers;

    constructor(){
        super();
    }

}

