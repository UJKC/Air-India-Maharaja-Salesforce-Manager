import { LightningElement, api, wire } from 'lwc';
import getIncidentsByAircraft from '@salesforce/apex/PreFlightController.getIncidentsByAircraft';

export default class IncidentTable extends LightningElement {
    @api recordId; // Pre_Flight_Task__c Id

    incidentData = [];

    columns = [
        { label: 'Root Cause Analysis', fieldName: 'Root_cause_analysis__c', type: 'text' },
        { label: 'Concerned Issue', fieldName: 'Concerned_Issue__c', type: 'text' },
        { label: 'Status', fieldName: 'Status__c', type: 'text' },
        { label: 'Description', fieldName: 'Describe_Incident__c', type: 'text' }
    ];

    @wire(getIncidentsByAircraft, { preFlightTaskId: '$recordId' })
    wiredIncidents({ error, data }) {
        if (data) {
            this.incidentData = data;
        } else if (error) {
            console.error('Error fetching incidents:', error);
        }
    }
}