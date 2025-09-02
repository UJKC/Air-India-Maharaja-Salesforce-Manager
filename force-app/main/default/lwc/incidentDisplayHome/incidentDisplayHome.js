import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import getIncidents from '@salesforce/apex/incidentController2.getIncidents';

export default class IncidentDisplayHome extends NavigationMixin(LightningElement) {
    @track groupedIncidents = {
        Queued: [],
        UnderInvestigation: [],
        Resolved: []
    };

    wiredIncidentsResult; // to hold reference for refreshApex
    refreshInterval;

    @wire(getIncidents)
    wiredIncidents(result) {
        this.wiredIncidentsResult = result; // store the reference
        const { data, error } = result;

        if (data) {
            this.groupedIncidents = {
                Queued: data.filter(i => i.Status__c === 'Queued'),
                UnderInvestigation: data.filter(i => i.Status__c === 'Under Investigation'),
                Resolved: data.filter(i => i.Status__c === 'Resolved')
            };
        } else if (error) {
            console.error('Error fetching incidents:', error);
        }
    }

    connectedCallback() {
        // Auto refresh every 1 second
        this.refreshInterval = setInterval(() => {
            if (this.wiredIncidentsResult) {
                refreshApex(this.wiredIncidentsResult);
            }
        }, 1000);
    }

    disconnectedCallback() {
        // Clear interval to avoid memory leaks
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    handleCardClick(event) {
        const recordId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId,
                objectApiName: 'Incident__c',
                actionName: 'view'
            }
        });
    }
}