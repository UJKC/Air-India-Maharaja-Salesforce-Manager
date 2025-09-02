import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getMaintenanceWithAircraft from '@salesforce/apex/MaintenanceController.getMaintenanceWithAircraft';

export default class MaintenanceAircraftDetails extends NavigationMixin(LightningElement) {
    @api recordId; // Maintenance record Id
    maintenance;
    error;

    @wire(getMaintenanceWithAircraft, { maintenanceId: '$recordId' })
    wiredData({ data, error }) {
        if (data) {
            this.maintenance = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.maintenance = undefined;
        }
    }

    navigateToAircraft() {
        if (this.maintenance?.Aircraft__c) {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.maintenance.Aircraft__c,
                    actionName: 'view'
                }
            });
        }
    }

    get hasAircraft() {
        return this.maintenance && this.maintenance.Aircraft__r;
    }
}
