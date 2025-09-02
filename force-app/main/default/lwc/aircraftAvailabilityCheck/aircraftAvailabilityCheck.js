// aircraftAvailability.js
import { LightningElement, api } from 'lwc';
import updateAircraftAvailability from '@salesforce/apex/FlightController.updateAircraftAvailability';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';

export default class AircraftAvailability extends LightningElement {
    @api recordId; // Flight record Id

    handleSetAvailable() {
        updateAircraftAvailability({ flightId: this.recordId })
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Aircraft marked as available.',
                    variant: 'success'
                })
            );
            // Refresh record page
            getRecordNotifyChange([{ recordId: this.recordId }]);
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }
}