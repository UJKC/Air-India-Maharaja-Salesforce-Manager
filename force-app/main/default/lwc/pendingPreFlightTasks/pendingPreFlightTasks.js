import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import getPendingPreFlightTasks from '@salesforce/apex/incidentController2.getPendingPreFlightTasks';

export default class PendingPreFlightTasks extends NavigationMixin(LightningElement) {
    @track tasks = [];
    wiredTaskResult;
    refreshInterval;

    // Pagination state
    pageSize = 6; // Number of records per page
    currentPage = 1;

    @wire(getPendingPreFlightTasks)
    wiredTasks(result) {
        this.wiredTaskResult = result;
        const { error, data } = result;
        if (data) {
            this.tasks = data;
        } else if (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    // Derived values for pagination
    get totalPages() {
        return Math.ceil(this.tasks.length / this.pageSize);
    }

    get paginatedTasks() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.tasks.slice(start, end);
    }

    get isEmpty() {
        return this.tasks.length === 0;
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    connectedCallback() {
        // Auto refresh every 10 seconds
        this.refreshInterval = setInterval(() => {
            if (this.wiredTaskResult) {
                refreshApex(this.wiredTaskResult);
            }
        }, 1000);
    }

    disconnectedCallback() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    handleCardClick(event) {
        const recordId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId,
                objectApiName: 'Pre_Flight_Task__c',
                actionName: 'view'
            }
        });
    }

    refreshData() {
        if (this.wiredTaskResult) {
            refreshApex(this.wiredTaskResult);
            this.currentPage = 1; // reset to first page on refresh
        }
    }
}