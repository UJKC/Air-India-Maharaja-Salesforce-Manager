import { LightningElement, api, wire, track } from 'lwc';
import getOtherMaintenances from '@salesforce/apex/MaintenanceController.getOtherMaintenances';
import { NavigationMixin } from 'lightning/navigation';

export default class OtherMaintenances extends NavigationMixin(LightningElement) {
    @api recordId;
    @track maintenances = [];
    @track error;

    @wire(getOtherMaintenances, { maintenanceId: '$recordId' })
    wiredMaintenances({ data, error }) {
        if (data) {
            this.maintenances = data.map(m => ({
                ...m,
                cardClass: this.getCardClass(m.Status__c),
                iconName: this.getIcon(m.Status__c)
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.maintenances = [];
        }
    }

    getCardClass(status) {
        switch (status) {
            case 'Scheduled': return 'status-card scheduled';
            case 'In Progress': return 'status-card inprogress';
            case 'Cleared': return 'status-card cleared';
            case 'Objection': return 'status-card objection';
            default: return 'status-card';
        }
    }

    getIcon(status) {
        switch (status) {
            case 'Scheduled': return 'utility:event';
            case 'In Progress': return 'utility:refresh';
            case 'Cleared': return 'utility:success';
            case 'Objection': return 'utility:error';
            default: return 'utility:record';
        }
    }

    navigateToRecord(event) {
        const recordId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId,
                actionName: 'view'
            }
        });
    }
}