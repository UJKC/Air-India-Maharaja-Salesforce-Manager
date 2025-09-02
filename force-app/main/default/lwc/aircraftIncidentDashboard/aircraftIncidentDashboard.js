import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAircraftIncidents from '@salesforce/apex/IncidentController1.getAircraftIncidents';

export default class AircraftIncidentDashboard extends NavigationMixin(LightningElement) {
    @api recordId; // Aircraft Id
    @track incidents = [];
    @track error;

    @wire(getAircraftIncidents, { aircraftId: '$recordId' })
    wiredIncidents({ data, error }) {
        if (data) {
            this.incidents = data.map(i => {
                const statusClass = this.getStatusClass(i.Status__c);
                const fullClass = `incident-card ${statusClass}`;
            
                return {
                    ...i,
                    cardClass: fullClass
                };
            });
            
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.incidents = [];
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'Queued': return 'status-queued';
            case 'Under Investigation': return 'status-investigation';
            case 'Resolved': return 'status-resolved';
            default: return 'status-default'; // fallback for null or unknown status
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
        return this.incidents && this.incidents.length > 0;
    }
}