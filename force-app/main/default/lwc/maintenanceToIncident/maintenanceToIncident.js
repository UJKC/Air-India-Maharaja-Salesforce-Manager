import { LightningElement , api , track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createIncident2 from '@salesforce/apex/incidentController2.createIncident2';

export default class MaintenanceToIncident extends LightningElement {
    @api recordId;
    @track selectedIssue = '';
    @track description = '';

    issueOptions = [
        { label: 'Fuel Check', value: 'Fuel Check' },
        { label: 'Oil Level Check', value: 'Oil Level Check' },
        { label: 'Tires And Brake', value: 'Tires And Brake' },
        { label: 'Instruments Functional', value: 'Instruments Functional' },
        { label: 'Emergency Equipment', value: 'Emergency Equipment' }
    ];

    handleIssueChange(event) {
        this.selectedIssue = event.detail.value;
        console.log(this.selectedIssue);
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
        console.log(this.description);
    }

    submitIncident() {
        createIncident2({
            maintenanceId: this.recordId,
            description: this.description,
            issue: this.selectedIssue
        })
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Incident logged successfully.',
                    variant: 'success'
                })
            );
            this.description = '';
            this.selectedIssue = '';
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }
}