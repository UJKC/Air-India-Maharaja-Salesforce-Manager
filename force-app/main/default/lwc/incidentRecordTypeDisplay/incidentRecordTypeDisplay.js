import { LightningElement, api, wire } from 'lwc';
import getRecordTypeName from '@salesforce/apex/incidentController2.getRecordTypeName';

export default class IncidentRecordTypeLabel extends LightningElement {
  @api recordId;
  recordTypeName;
  error;

  get label() {
    if (this.recordTypeName === 'Pre Flight Incident') {
      return 'Pre Flight Incident Record';
    } else if (this.recordTypeName === 'Maintenance Incident') {
      return 'Maintenance Incident Record';
    } else {
      return this.recordTypeName;
    }
  }

  @wire(getRecordTypeName, { incidentId: '$recordId' })
  wiredRecordType({ error, data }) {
    if (data) {
      this.recordTypeName = data;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.recordTypeName = undefined;
    }
  }
}