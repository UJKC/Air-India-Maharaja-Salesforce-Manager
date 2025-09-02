import { LightningElement, api, wire } from 'lwc';
import getIncidentsByAircraft from '@salesforce/apex/incidentController2.getIncidentsByAircraft'

export default class AircraftIncidentsTable extends LightningElement {
  @api recordId; // This should be the Incident__c Id
  incidents;
  error;

  columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Status', fieldName: 'Status__c' },
    { label: 'Record Type', fieldName: 'recordTypeName' },
    { label: 'Concerned Issue', fieldName: 'Concerned_Issue__c' },
    { label: 'Root Cause Analysis', fieldName: 'Root_cause_analysis__c' },
    { label: 'Description', fieldName: 'Describe_Incident__c' }
  ];

  @wire(getIncidentsByAircraft, { incidentId: '$recordId' })
  wiredIncidents({ error, data }) {
    if (data) {
      this.incidents = data.map(incident => ({
        ...incident,
        recordTypeName: incident.RecordType?.Name
      }));
      console.log(this.incidents);
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.incidents = undefined;
      console.log(error);
    }
  }
}