import { LightningElement, track, wire } from 'lwc';
import searchIncidents from '@salesforce/apex/IncidentController1.searchIncidents';
import getSearchedIncidents from '@salesforce/apex/IncidentController1.getSearchedIncidents';
import updateIncidents from '@salesforce/apex/IncidentController1.updateIncidents';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class IncidentSearchEdit extends LightningElement {
    @track searchKey = '';
    @track searchResults = [];
    @track incidentId = '';

    statusOptions = [
        { label: 'Queued', value: 'Queued' },
        { label: 'Under Investigation', value: 'Under Investigation' },
        { label: 'Resolved', value: 'Resolved' }
    ];

    handleSearchChange(event) {
        this.searchKey = event.target.value;
        if (this.searchKey.length > 1) {
            searchIncidents({ searchKey: this.searchKey })
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
        getSearchedIncidents({ recordId })
            .then(result => {
                this.incidentId = result;
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    handleStatusChange(event) {
        this.selectedStatus = event.detail.value;
    }

    handleSave() {
        updateIncidents({ incidentId: this.incidentId })
        .then(() => {
            this.showToast('Success', 'Incident record updated successfully', 'success');
        })
        .catch(error => {
            this.showToast('Error', error.body.message, 'error');
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}
