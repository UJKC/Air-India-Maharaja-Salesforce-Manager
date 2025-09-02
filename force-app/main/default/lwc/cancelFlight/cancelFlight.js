import { LightningElement, api } from 'lwc';
import flightCancellation from '@salesforce/apex/FlightController.flightCancellation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';

export default class CancelFlight extends LightningElement {
    @api recordId; // receives current Flight__c record Id if used on record page

    handleCancel() {
        flightCancellation({ flightId: this.recordId })
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Flight has been cancelled.',
                    variant: 'success'
                })
            );
            // Refresh record view
            getRecordNotifyChange([{ recordId: this.recordId }]);
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error cancelling flight',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }
}