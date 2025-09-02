import { LightningElement, wire, track } from 'lwc';
import getIncidents from '@salesforce/apex/IncidentController.getIncidents';
import updateIncidents from '@salesforce/apex/IncidentController.updateIncidents';

export default class IncidentManager extends LightningElement {
  @track incidents = [];
  @track filteredIncidents = [];
  @track draftValues = [];
  selectedStatus = '';
  selectedName = '';

  statusOptions = [
    { label: 'Queued', value: 'Queued' },
    { label: 'Under Investigation', value: 'Under Investigation' },
    { label: 'Resolved', value: 'Resolved' }
  ];

  nameOptions = [];

  columns = [
    { label: 'Name', fieldName: 'Name' },
    {
      label: 'Status',
      fieldName: 'Status__c',
      type: 'picklist',
      editable: true
    },
    {
      label: 'Root Cause Analysis',
      fieldName: 'Root_cause_analysis__c',
      type: 'text',
      editable: true
    }
  ];

  @wire(getIncidents)
  wiredIncidents({ error, data }) {
    if (data) {
      this.incidents = data;
      this.filteredIncidents = data;
      this.nameOptions = [
        ...new Set(data.map(item => item.Name))
      ].map(name => ({ label: name, value: name }));
    } else if (error) {
      console.error(error);
    }
  }

  handleStatusChange(event) {
    this.selectedStatus = event.detail.value;
    this.applyFilters();
  }

  handleNameChange(event) {
    this.selectedName = event.detail.value;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredIncidents = this.incidents.filter(incident => {
      return (!this.selectedStatus || incident.Status__c === this.selectedStatus) &&
             (!this.selectedName || incident.Name === this.selectedName);
    });
  }

  handleSave(event) {
    const updatedFields = event.detail.draftValues;
    this.draftValues = [];

    updateIncidents({ data: updatedFields })
      .then(() => {
        return refreshApex(this.wiredIncidents);
      })
      .catch(error => {
        console.error('Error updating records', error);
      });
  }
}
