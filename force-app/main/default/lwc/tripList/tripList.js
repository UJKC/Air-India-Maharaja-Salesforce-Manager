// tripList.js
import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAllTrips from '@salesforce/apex/FlightController.getAllTrips';

const PAGE_SIZE = 5; // how many trips per page

export default class TripList extends NavigationMixin(LightningElement) {
    @api recordId; // Aircraft Id

    allFlights = [];
    @track flights = [];
    error;

    currentPage = 1;
    totalPages = 1;

    @wire(getAllTrips, { aircraftId: '$recordId' })
    wiredTrips({ data, error }) {
        if (data) {
            this.allFlights = data.map(f => ({
                ...f,
                delayedText: f.Delayed__c ? 'Yes' : 'No',
                cardClass: f.Delayed__c
                    ? 'slds-box slds-m-around_medium slds-p-around_medium slds-card delayed'
                    : 'slds-box slds-m-around_medium slds-p-around_medium slds-card'
            }));
            this.totalPages = Math.ceil(this.allFlights.length / PAGE_SIZE);
            this.setPage(1);
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.allFlights = [];
            this.flights = [];
        }
    }

    get hasFlights() {
        return this.flights && this.flights.length > 0;
    }

    setPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        this.flights = this.allFlights.slice(start, end);
    }

    handlePrev() {
        this.setPage(this.currentPage - 1);
    }

    handleNext() {
        this.setPage(this.currentPage + 1);
    }

    handleNavigate(event) {
        const flightId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: flightId,
                objectApiName: 'Flight__c',
                actionName: 'view'
            }
        });
    }

    get pageInfo() {
        return `${this.currentPage} / ${this.totalPages}`;
    }

    get disablePrev() {
        return this.currentPage === 1;
    }

    get disableNext() {
        return this.currentPage === this.totalPages;
    }
}