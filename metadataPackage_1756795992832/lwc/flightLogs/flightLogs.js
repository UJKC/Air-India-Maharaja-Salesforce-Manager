import { LightningElement, api, wire, track } from 'lwc';
import getLogs from '@salesforce/apex/FlightLogController.getLogs';

export default class FlightLogs extends LightningElement {
    @api recordId; // Flight Id
    allLogs = [];
    @track logs = [];

    generalChecked = true;
    delayedChecked = true;
    cancelledChecked = true;
    error;

    // Pagination state
    currentPage = 1;
    pageSize = 5;

    @wire(getLogs, { flightId: '$recordId' })
    wiredLogs({ data, error }) {
        if (data) {
            this.allLogs = data;
            this.applyFilters();
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.logs = [];
        }
    }

    handleCheckboxChange(event) {
        const { name, checked } = event.target;
        if (name === 'general') this.generalChecked = checked;
        if (name === 'delayed') this.delayedChecked = checked;
        if (name === 'cancelled') this.cancelledChecked = checked;
        this.applyFilters();
    }

    applyFilters() {
        const filtered = this.allLogs.filter(log => {
            const message = log.Message__c || '';

            // Check each filter
            const showGeneral = this.generalChecked && !message.includes('Delay') && !message.toLowerCase().includes('cancelled');
            const showDelayed = this.delayedChecked && message.includes('Delay');
            const showCancelled = this.cancelledChecked && message.toLowerCase().includes('cancelled');

            return showGeneral || showDelayed || showCancelled;
        });

        this.logs = filtered;
        this.currentPage = 1; // reset to first page after filtering
    }

    // Computed pagination
    get totalPages() {
        return Math.ceil(this.logs.length / this.pageSize) || 1;
    }

    get paginatedLogs() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = this.currentPage * this.pageSize;
        return this.logs.slice(start, end).map(log => {
            return {
                ...log,
                formattedDate: this.formatDate(log.Timestamp__c)
            };
        });
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    handlePrev() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    get hasLogs() {
        return this.logs && this.logs.length > 0;
    }

    get isPrevDisabled() {
        return this.currentPage === 1;
    }
    
    get isNextDisabled() {
        return this.currentPage === this.totalPages;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }).format(date);
    }
}
