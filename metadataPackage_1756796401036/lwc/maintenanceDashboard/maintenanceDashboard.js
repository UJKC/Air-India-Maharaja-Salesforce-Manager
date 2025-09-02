import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getMaintenances from '@salesforce/apex/MaintenanceController.getMaintenances';

export default class MaintenanceDashboard extends NavigationMixin(LightningElement) {
    @api recordId; // Aircraft Id
    @track maintenances = [];
    @track error;

    @wire(getMaintenances, { aircraftId: '$recordId' })
    wiredMaintenances({ data, error }) {
        if (data) {
            this.maintenances = data.map(m => {
                const checkboxes = [
                    m.Airframe_Inspection__c,
                    m.Avionics_and_Instruments__c,
                    m.Cabin_and_Interior__c,
                    m.Documentation_and_Compliance__c,
                    m.Electrical_Systems__c,
                    m.Fire_Protection_and_Safety_Equipment__c,
                    m.Hydraulic_and_Pneumatic_Systems__c,
                    m.Powerplant_Engine__c
                ];
                const checkedCount = checkboxes.filter(c => c === true).length;
            
                // Compute full class for the card
                const cardClass = `maintenance-card ${this.getStatusClass(m.Status__c)}`;
            
                return {
                    ...m,
                    checkedCount,
                    totalCheckboxes: checkboxes.length,
                    cardClass // use this in HTML
                };
            });
            
            this.error = undefined;
        } else if (error) {
            this.maintenances = [];
            this.error = error;
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'Scheduled': return 'status-scheduled';
            case 'In Progress': return 'status-inprogress';
            case 'Cleared': return 'status-cleared';
            case 'Objection': return 'status-objection';
            default: return 'status-default';
        }
    }

    handleNavigate(event) {
        const maintenanceId = event.currentTarget.dataset.id;
        if (!maintenanceId) return;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: maintenanceId,
                objectApiName: 'Maintenance__c',
                actionName: 'view'
            }
        });
    }

    get hasMaintenances() {
        return this.maintenances && this.maintenances.length > 0;
    }
}
