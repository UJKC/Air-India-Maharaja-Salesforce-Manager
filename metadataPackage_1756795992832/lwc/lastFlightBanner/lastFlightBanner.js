// lastTripCard.js
import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getLastTrip from '@salesforce/apex/FlightController.getLastTrip';

export default class LastTripCard extends NavigationMixin(LightningElement) {
    @api recordId; // Aircraft Id

    flight;
    error;

    @wire(getLastTrip, { aircraftId: '$recordId' })
    wiredTrip({ data, error }) {
        if (data) {
            this.flight = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.flight = undefined;
        }
    }

    get cardClass() {
        return this.flight?.Delayed__c
            ? 'slds-box slds-m-around_medium slds-p-around_medium slds-card delayed'
            : 'slds-box slds-m-around_medium slds-p-around_medium slds-card';
    }

    get delayedText() {
        return this.flight?.Delayed__c ? 'Yes' : 'No';
    }

    handleNavigate() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.flight.Id,
                objectApiName: 'Flight__c',
                actionName: 'view'
            }
        });
    }
}
