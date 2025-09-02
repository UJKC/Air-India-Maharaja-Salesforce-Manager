import { LightningElement, api, track } from 'lwc';

export default class FlightList extends LightningElement {
    @api title;
    @api timeField;
    @api timeLabel;
    _flights = [];
    @track currentPage = 1;
    pageSize = 3;

    @api
    set flights(value) {
        if (value && this.timeField) {
            this._flights = value.map(flight => ({
                ...flight,
                cssClass: flight.Delayed__c
                    ? 'slds-box slds-p-around_medium slds-theme_error slds-m-bottom_x-small'
                    : 'slds-box slds-p-around_medium slds-theme_default slds-m-bottom_x-small',
                displayTime: flight[this.timeField]
            }));
        } else {
            this._flights = value || [];
        }
        this.currentPage = 1; // reset page when flights change
    }

    get flights() {
        return this._flights;
    }

    get totalPages() {
        return Math.ceil(this._flights.length / this.pageSize) || 1;
    }

    get paginatedFlights() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this._flights.slice(start, end);
    }

    get isPrevDisabled() {
        return this.currentPage <= 1;
    }

    get isNextDisabled() {
        return this.currentPage >= this.totalPages;
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

    handleClick(event) {
        const flightId = event.currentTarget.dataset.id;
        this.dispatchEvent(new CustomEvent('flightclick', { detail: flightId }));
    }
}