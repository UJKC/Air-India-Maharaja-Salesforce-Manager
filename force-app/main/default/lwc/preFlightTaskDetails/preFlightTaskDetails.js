import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getTaskWithFlight from '@salesforce/apex/PreFlightController.getTaskWithFlight';

export default class PreFlightTaskDetails extends NavigationMixin(LightningElement) {
    @api recordId;
    task;
    error;

    @wire(getTaskWithFlight, { taskId: '$recordId' })
    wiredTask({ error, data }) {
        if (data) {
            this.task = {
                ...data,
                formattedSchedule: this.formatDate(data.Flight__r.Schedule__c),
                formattedArrival: this.formatDate(data.Flight__r.Destination_Time__c)
            };
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.task = undefined;
        }
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return new Date(dateString).toLocaleString('en-US', options);
    }

    navigateToFlight() {
        if (!this.task || !this.task.Flight__r) return;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.task.Flight__r.Id,
                objectApiName: 'Flight__c',
                actionName: 'view'
            }
            
        });
    }
}