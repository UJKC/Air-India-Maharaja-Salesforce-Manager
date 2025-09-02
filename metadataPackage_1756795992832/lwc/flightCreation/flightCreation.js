import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FlightCreator extends LightningElement {
    
    handleSuccess(event) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Flight created successfully! Record Id: ' + event.detail.id,
                variant: 'success'
            })
        );
    }

    handleError(event) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error creating flight',
                message: event.body.message,
                variant: 'error'
            })
        );
    }
}
