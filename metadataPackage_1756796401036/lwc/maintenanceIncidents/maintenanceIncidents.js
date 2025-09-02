import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getIncidentsByMaintenance from '@salesforce/apex/IncidentController1.getIncidentsByMaintenance';

export default class MaintenanceIncidents extends NavigationMixin(LightningElement) {
    @api recordId;   // Maintenance Id
    @track incidents = [];
    @track error;

    @wire(getIncidentsByMaintenance, { maintenanceId: '$recordId' })
    wiredIncidents({ data, error }) {
        if (data) {
            this.incidents = data.map(inc => ({
                ...inc,
                cssClass: this.getStatusClass(inc.Status__c)
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.incidents = [];
        }
    }

    get hasIncidents() {
        return this.incidents && this.incidents.length > 0;
    }

    // helper for status -> CSS
    getStatusClass(status) {
        switch (status) {
            case 'Open': return 'slds-box slds-theme_warning';
            case 'In Progress': return 'slds-box slds-theme_info';
            case 'Resolved': return 'slds-box slds-theme_success';
            case 'Escalated': return 'slds-box slds-theme_error';
            default: return 'slds-box slds-theme_default';
        }
    }

    // navigation to record page
    navigateToIncident(event) {
        const recId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recId,
                objectApiName: 'Incident__c',
                actionName: 'view'
            }
        });
    }
}
