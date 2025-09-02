import { LightningElement, api, wire, track } from 'lwc';
import getLatestDelayLog from '@salesforce/apex/FlightDelayLogController.getLatestDelayLog';
import updateDelayReason from '@salesforce/apex/FlightDelayLogController.updateDelayReason';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FlightDelayReason extends LightningElement {
    @api recordId; // Flight__c Id
    @track delayLog;
    @track reason = '';
    @track isSubmitting = false;

    @wire(getLatestDelayLog, { flightId: '$recordId' })
    wiredLog({ data, error }) {
        if (data) {
            this.delayLog = data;
            this.reason = data.Reason__c || '';
        } else {
            this.delayLog = null;
        }
    }

    handleChange(event) {
        this.reason = event.target.value;
    }

    handleSubmit() {
        if (!this.reason || !this.delayLog) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please enter a reason before submitting.',
                    variant: 'error'
                })
            );
            return;
        }

        this.isSubmitting = true;

        updateDelayReason({ logId: this.delayLog.Id, reason: this.reason })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Delay reason updated successfully.',
                        variant: 'success'
                    })
                );
                this.isSubmitting = false;
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error updating delay reason',
                        message: error.body ? error.body.message : error.message,
                        variant: 'error'
                    })
                );
                this.isSubmitting = false;
            });
    }

    get showForm() {
        return this.delayLog != null;
    }
}