import { Provider, Providers } from '../internal';

/** @public */
export class AwsProvider extends Provider{

    override _provider = 'aws' as Providers;

    constructor(){
        super();
    }

}

/** @public */
export class GcpProvider extends Provider{

    override _provider = 'gcp' as Providers;

    constructor(){
        super();
    }

}

/** @public */
export class AzureProvider extends Provider{

    override _provider = 'azure' as Providers;

    constructor(){
        super();
    }

}

/** @public */
export class CustomProvider extends Provider{
    
    _provider: Providers;

    constructor(identity : string){
        super();
        this._provider = identity as Providers;
    }

}


