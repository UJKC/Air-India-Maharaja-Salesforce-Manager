import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

// Field API name
import IS_AVAILABLE_FIELD from '@salesforce/schema/Aircraft__c.IsAvailable__c';

const FIELDS = [IS_AVAILABLE_FIELD];

export default class AircraftAvailabilityBanner extends LightningElement {
    @api recordId; // Automatically passed when used on a record page
    isAvailable;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            this.isAvailable = data.fields.IsAvailable__c.value;
        } else if (error) {
            console.error('Error fetching record:', error);
        }
    }
}