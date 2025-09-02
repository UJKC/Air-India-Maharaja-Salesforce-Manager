import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getLatestPreFlightTask from '@salesforce/apex/FlightController.getLatestPreFlightTask';

export default class LatestPreFlightTask extends NavigationMixin(LightningElement) {
    @api recordId; // Flight Id
    @track preFlightTask;
    @track error;

    @wire(getLatestPreFlightTask, { flightId: '$recordId' })
    wiredTask({ data, error }) {
        if (data) {
            this.preFlightTask = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.preFlightTask = undefined;
        }
    }

    get checkboxes() {
        if (!this.preFlightTask) return [];
        const fields = [
            { label: 'Emergency Equipment', value: this.preFlightTask.Emergency_Equipment__c, icon: 'utility:check' },
            { label: 'Fuel Checked', value: this.preFlightTask.Fuel_Checked__c, icon: 'utility:check' },
            { label: 'Instruments Functional', value: this.preFlightTask.Instruments_Functional__c, icon: 'utility:check' },
            { label: 'Oil Level Checked', value: this.preFlightTask.Oil_Level_Checked__c, icon: 'utility:check' },
            { label: 'Tires And Brakes', value: this.preFlightTask.Tires_And_Brakes__c, icon: 'utility:check' }
        ];
        return fields;
    }

    get checkedCount() {
        return this.checkboxes.filter(c => c.value).length;
    }

    get totalCount() {
        return this.checkboxes.length;
    }

    navigateToTask() {
        if (!this.preFlightTask) return;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.preFlightTask.Id,
                objectApiName: 'Pre_Flight_Task__c',
                actionName: 'view'
            }
        });
    }

    getCheckboxClass(field) {
        return field.value ? 'slds-icon-text-success' : 'slds-icon-text-default';
    }

    getFieldClass(field) {
        return field.value ? 'slds-text-color_success' : 'slds-text-color_weak';
    }

    get checkboxes() {
        if (!this.preFlightTask) return [];
        const fields = [
            { label: 'Emergency Equipment', value: this.preFlightTask.Emergency_Equipment__c },
            { label: 'Fuel Checked', value: this.preFlightTask.Fuel_Checked__c },
            { label: 'Instruments Functional', value: this.preFlightTask.Instruments_Functional__c },
            { label: 'Oil Level Checked', value: this.preFlightTask.Oil_Level_Checked__c },
            { label: 'Tires And Brakes', value: this.preFlightTask.Tires_And_Brakes__c }
        ];
        return fields.map(f => ({
            ...f,
            iconClass: f.value ? 'checked-icon' : 'unchecked-icon',
            textClass: f.value ? 'checked-text' : 'unchecked-text'
        }));
    }
    
    
    
}
