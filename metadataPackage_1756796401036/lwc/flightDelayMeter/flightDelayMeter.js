// flightDelayMeter.js
import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getLatestDelay from '@salesforce/apex/FlightDelayLogController.getLatestDelay';

export default class FlightDelayMeter extends NavigationMixin(LightningElement) {
    @api recordId; // Flight Id
    delayLog;
    error;

    @wire(getLatestDelay, { flightId: '$recordId' })
    wiredDelay({ data, error }) {
        if (data) {
            this.delayLog = data;
            this.error = undefined;
        } else if (error) {
            this.delayLog = undefined;
            this.error = error;
        }
    }

    get hasDelay() {
        return !!this.delayLog;
    }

    navigateToDelayLog() {
        if (!this.delayLog) return;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.delayLog.Id,
                objectApiName: 'FlightDelayLog__c',
                actionName: 'view'
            }
        });
    }
}
