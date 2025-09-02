import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getDueOrOverdueIncidents from '@salesforce/apex/incidentController2.getDueOrOverdueIncidents';

export default class IncidentOrOverdue extends NavigationMixin(LightningElement) {
    @track incidents = [];
    @track currentPage = 1;
    pageSize = 3;
    wiredResult;
    refreshInterval;

    connectedCallback() {
        // refresh data every 1 second
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 1000);
    }

    disconnectedCallback() {
        // clear interval when component is destroyed
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    @wire(getDueOrOverdueIncidents)
    wiredIncidents(result) {
        this.wiredResult = result;
        const { data, error } = result;

        if (data) {
            this.incidents = data
                .filter(incident => incident.Status__c !== 'Resolved')
                .map(incident => {
                    return {
                        ...incident,
                        formattedDueDate: this.formatDate(incident.Complete_By__c)
                    };
                });
        } else if (error) {
            console.error('Error fetching due/overdue incidents:', error);
        }
    }

    // Method to refresh Apex data
    refreshData() {
        return getDueOrOverdueIncidents()
            .then(data => {
                this.incidents = data
                    .filter(incident => incident.Status__c !== 'Resolved')
                    .map(incident => {
                        return {
                            ...incident,
                            formattedDueDate: this.formatDate(incident.Complete_By__c)
                        };
                    });
            })
            .catch(error => {
                console.error('Error refreshing incidents:', error);
            });
    }

    get paginatedIncidents() {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.incidents.slice(start, start + this.pageSize);
    }

    get isEmpty() {
        return this.incidents.length === 0;
    }

    get totalPages() {
        return Math.ceil(this.incidents.length / this.pageSize);
    }

    get disablePrev() {
        return this.currentPage === 1;
    }

    get disableNext() {
        return this.currentPage === this.totalPages || this.totalPages === 0;
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    formatDate(dateValue) {
        if (!dateValue) return '';
        try {
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(dateValue));
        } catch (e) {
            console.error('Error formatting date:', e);
            return dateValue;
        }
    }

    handleCardClick(event) {
        const recordId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Incident__c',
                actionName: 'view'
            }
        });
    }
}