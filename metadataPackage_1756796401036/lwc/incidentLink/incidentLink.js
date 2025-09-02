import { LightningElement, api, track, wire } from 'lwc';
import getIncidents from '@salesforce/apex/IncidentController1.getIncidents';
import { NavigationMixin } from 'lightning/navigation';

export default class IncidentList extends NavigationMixin(LightningElement) {
    @api recordId; // Flight Id from record page
    @track incidentsData = [];
    @track error;

    @wire(getIncidents, { flightId: '$recordId' })
    wiredIncidents({ data, error }) {
        if (data) {
            // Preprocess incidents to include CSS class based on Status
            this.incidentsData = data.map(i => {
                let statusClass;
                switch ((i.Status__c || '').replace(/\s+/g, '_')) {
                    case 'Queued': statusClass = 'status-Queued'; break;
                    case 'Under Investigation': statusClass = 'status-Under_Investigation'; break;
                    case 'Resolved': statusClass = 'status-Resolved'; break;
                    default: statusClass = 'status-default';
                }
                return { ...i, cardClass: `incident-card ${statusClass}` };
            });
            this.error = undefined;
        } else if (error) {
            this.incidentsData = [];
            this.error = error;
        }
    }

    handleNavigate(event) {
        const incidentId = event.currentTarget.dataset.id;
        if (!incidentId) return;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: incidentId,
                objectApiName: 'Incident__c',
                actionName: 'view'
            }
        });
    }

    get hasIncidents() {
        return this.incidentsData && this.incidentsData.length > 0;
    }
}
