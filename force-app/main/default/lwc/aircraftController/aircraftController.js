import { LightningElement, api, wire, track } from 'lwc';
import getAircraftFromTask from '@salesforce/apex/PreFlightController.getAircraftFromTask';

export default class AircraftController extends LightningElement {
    @api recordId; // Pre_Flight_Task__c Id
    @track aircraft;
    @track error;

    @wire(getAircraftFromTask, { preFlightTaskId: '$recordId' })
    wiredAircraft({ error, data }) {
        if (data) {
            this.aircraft = data;
            this.error = undefined;
        } else if (error) {
            this.error = error.body.message;
            this.aircraft = undefined;
        }
    }
}