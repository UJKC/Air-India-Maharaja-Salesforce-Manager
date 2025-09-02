import { LightningElement, api, wire } from 'lwc';
import getAircraftDetails from '@salesforce/apex/incidentController2.getAircraftDetails';

export default class IncidentDetailsDisplay extends LightningElement {
    @api recordId;
    aircraft;
    error;
  
    @wire(getAircraftDetails, { incidentId: '$recordId' })
    wiredAircraft({ error, data }) {
      if (data) {
        this.aircraft = data;
        this.error = undefined;
      } else if (error) {
        this.error = error;
        this.aircraft = undefined;
      }
    }
  
}