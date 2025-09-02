import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAircraftList from '@salesforce/apex/MaintenanceController.getAircrafts';

export default class MaintenanceForm extends LightningElement {
    @track aircraftOptions = [];
    @track aircraftId;

    // Load Aircrafts into combobox
    @wire(getAircraftList)
    wiredAircrafts({ error, data }) {
        if (data) {
            this.aircraftOptions = data.map(ac => ({
                label: ac.Name,
                value: ac.Id
            }));
        } else if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading Aircrafts',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        }
    }

    handleAircraftChange(event) {
        this.aircraftId = event.detail.value;
    }

    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        fields.Aircraft__c = this.aircraftId;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleSuccess() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Maintenance record created successfully!',
                variant: 'success'
            })
        );
        this.template.querySelector('lightning-record-edit-form').reset();
        this.aircraftId = null;
    }

    handleError(event) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error creating record',
                message: event.detail.message,
                variant: 'error'
            })
        );
    }
}