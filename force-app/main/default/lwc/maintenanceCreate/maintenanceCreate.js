import { LightningElement, track } from 'lwc';
import createMaintenance from '@salesforce/apex/MaintenanceController.createMaintenance';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MaintenanceCreateWithApex extends LightningElement {
    @track aircraftId = null;
    @track aircraftName = '';
    @track maintenanceDate = '';

    handleAircraftSelect(event) {
        this.aircraftId = event.detail.Id;
        this.aircraftName = event.detail.Name;
    }

    handleDateChange(event) {
        this.maintenanceDate = event.target.value;
    }

    handleSave() {
        if (!this.aircraftId) {
            this.showToast('Error', 'Please select an Aircraft', 'error');
            return;
        }
        if (!this.maintenanceDate) {
            this.showToast('Error', 'Please select Maintenance Date', 'error');
            return;
        }

        // Call Apex to insert the Maintenance record
        createMaintenance({
            aircraftId: this.aircraftId,
            maintenanceDate: this.maintenanceDate
        })
        .then(result => {
            this.showToast('Success', `Maintenance created successfully`, 'success');

            // Reset form
            this.aircraftId = null;
            this.aircraftName = '';
            this.maintenanceDate = '';
        })
        .catch(error => {
            this.showToast('Error', error.body ? error.body.message : error.message, 'error');
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}