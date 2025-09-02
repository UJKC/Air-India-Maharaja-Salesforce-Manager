import { LightningElement, track } from 'lwc';
import getMaintenanceById from '@salesforce/apex/MaintenanceController.getMaintenanceById';
import updateMaintenance from '@salesforce/apex/MaintenanceController.updateMaintenance';
import searchMaintenance from '@salesforce/apex/MaintenanceController.searchMaintenance';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MaintenanceEditor extends LightningElement {
    @track searchKey = '';
    @track searchResults = [];
    @track maintenance;

    statusOptions = [
        { label: 'Scheduled', value: 'Scheduled' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Objection', value: 'Objection' }
    ];

    get aircraftName() {
        return this.maintenance && this.maintenance.Aircraft__c 
            ? this.maintenance.Aircraft__r.Name 
            : '';
    }    

    handleSearchChange(event) {
        this.searchKey = event.target.value;
        if (this.searchKey.length > 1) {
            searchMaintenance({ searchKey: this.searchKey })
                .then(result => {
                    this.searchResults = result;
                })
                .catch(error => {
                    this.showToast('Error', error.body.message, 'error');
                });
        } else {
            this.searchResults = [];
        }
    }

    handleSelectRecord(event) {
        const recordId = event.target.dataset.id;
        getMaintenanceById({ recordId })
            .then(result => {
                this.maintenance = result;
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    handleFieldChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.maintenance = { ...this.maintenance, [field]: value };
    }

    handleSave() {
        updateMaintenance({ maintenance: this.maintenance })
        .then(() => {
            this.showToast('Success', 'Maintenance record updated successfully', 'success');
        })
        .catch(error => {
            this.showToast('Error', error.body.message, 'error');
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
