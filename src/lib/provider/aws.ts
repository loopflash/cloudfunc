import { ContainerBase } from "../internal";

export class AwsProvider extends ContainerBase{

    private _eventType : AwsEvent;

    setEvent(event : AwsEvent){
        this._eventType = event;
    }

    setContext(
        event : any,
        context? : any
    ){
        this.addContext(event, context);
    }

    /***
     * Override
     */
    transform(event : any){
        return event;
    }

}

export enum AwsEvent{
    APIGATEWAY
} 