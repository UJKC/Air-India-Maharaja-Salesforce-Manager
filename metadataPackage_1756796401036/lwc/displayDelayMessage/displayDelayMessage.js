import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

// Fields
import DELAYED_FIELD from '@salesforce/schema/Flight__c.Delayed__c';
import NAME_FIELD from '@salesforce/schema/Flight__c.Name';
import STATUS_FIELD from '@salesforce/schema/Flight__c.Status__c';

export default class DisplayDelayMessage extends LightningElement {
    @api recordId; // Gets the current record Id when placed on a record page

    delayed;
    flightName;
    status;

    @wire(getRecord, { recordId: '$recordId', fields: [DELAYED_FIELD, NAME_FIELD, STATUS_FIELD] })
    wiredFlight({ error, data }) {
        if (data) {
            this.delayed = data.fields.Delayed__c.value;
            this.flightName = data.fields.Name.value;
            this.status = data.fields.Status__c.value;
        } else if (error) {
            console.error(error);
        }
    }
    get showDelayMessage() {
        if(this.delayed == true && this.status != 'Cancelled'){
            return this.delayed;
        }
    }
    get showCancelMessage() {
        if(this.status == 'Cancelled'){
            this.delayed = true;
            return this.delayed;
        }
    }
}
