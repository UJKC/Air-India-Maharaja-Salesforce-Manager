import { LightningElement, api, wire, track } from 'lwc';
import getIncidentsForTask from '@salesforce/apex/PreFlightController.getIncidentsForTask';
import { refreshApex } from '@salesforce/apex';

export default class IncidentList extends LightningElement {
    @api recordId;
    @track incidents;
    @track error;

    wiredResult;
    intervalId;

    @wire(getIncidentsForTask, { taskId: '$recordId' })
    wiredIncidents(result) {
        this.wiredResult = result;
        const { error, data } = result;
        if (data) {
            this.incidents = data.map(incident => ({
                ...incident,
                cardClass: this.getCardClass(incident.Status__c)
            }));
            this.error = undefined;
        } else {
            this.error = error;
            this.incidents = undefined;
        }
    }

    connectedCallback() {
        this.intervalId = setInterval(() => {
            if (this.wiredResult) {
                refreshApex(this.wiredResult);
            }
        }, 2000); // Refresh every 2 seconds
    }

    disconnectedCallback() {
        clearInterval(this.intervalId);
    }

    getCardClass(status) {
        switch (status?.toLowerCase()) {
            case 'queued':
                return 'incident-card queued';
            case 'resolved':
                return 'incident-card resolved';
            case 'in progress':
                return 'incident-card in-progress';
            default:
                return 'incident-card default';
        }
    }
}