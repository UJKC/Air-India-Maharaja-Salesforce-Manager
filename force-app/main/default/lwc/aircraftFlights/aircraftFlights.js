import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAircraftFlights from '@salesforce/apex/AircraftController.getAircraftFlights';

export default class AircraftFlights extends NavigationMixin(LightningElement) {
    @api recordId;
    searchKey = '';
    selectedDate = '';

    @wire(getAircraftFlights, { aircraftId: '$recordId' })
    flights;

    get filteredArrivals() {
        if (!this.flights.data?.arrivals) return [];
    
        return this.flights.data.arrivals.filter(flight => {
            const matchesSearch =
                !this.searchKey ||
                (flight.Name && flight.Name.toLowerCase().includes(this.searchKey.toLowerCase())) ||
                (flight.Status__c && flight.Status__c.toLowerCase().includes(this.searchKey.toLowerCase())) ||
                (flight.Start_Airport__r?.Name && flight.Start_Airport__r.Name.toLowerCase().includes(this.searchKey.toLowerCase())) ||
                (flight.End_Airport__r?.Name && flight.End_Airport__r.Name.toLowerCase().includes(this.searchKey.toLowerCase()));
    
            const matchesDate =
                !this.selectedDate || // if no date set → always true
                (flight.Destination_Time__c && flight.Destination_Time__c.startsWith(this.selectedDate));
    
            return matchesSearch && matchesDate;
        });
    }
    
    get filteredDepartures() {
        if (!this.flights.data?.departures) return [];
    
        return this.flights.data.departures.filter(flight => {
            const matchesSearch =
                !this.searchKey ||
                (flight.Name && flight.Name.toLowerCase().includes(this.searchKey.toLowerCase())) ||
                (flight.Status__c && flight.Status__c.toLowerCase().includes(this.searchKey.toLowerCase())) ||
                (flight.Start_Airport__r?.Name && flight.Start_Airport__r.Name.toLowerCase().includes(this.searchKey.toLowerCase())) ||
                (flight.End_Airport__r?.Name && flight.End_Airport__r.Name.toLowerCase().includes(this.searchKey.toLowerCase()));
    
            const matchesDate =
                !this.selectedDate || // if no date set → always true
                (flight.Schedule__c && flight.Schedule__c.startsWith(this.selectedDate));
    
            return matchesSearch && matchesDate;
        });
    }
    

    // Apply search and date filters
    applyFilters(list, dateField) {
        return list.filter(flight => {
            const matchesSearch = this.searchKey === '' ||
                (flight.Name && flight.Name.toLowerCase().includes(this.searchKey.toLowerCase())) ||
                (flight.Status__c && flight.Status__c.toLowerCase().includes(this.searchKey.toLowerCase())) ||
                (flight.Start_Airport__r?.Name && flight.Start_Airport__r.Name.toLowerCase().includes(this.searchKey.toLowerCase())) ||
                (flight.End_Airport__r?.Name && flight.End_Airport__r.Name.toLowerCase().includes(this.searchKey.toLowerCase()));

            const matchesDate = this.selectedDate === '' ||
                (flight[dateField] && flight[dateField].startsWith(this.selectedDate));

            return matchesSearch && matchesDate;
        });
    }

    handleSearchChange(event) {
        this.searchKey = event.target.value;
    }

    handleDateChange(event) {
        this.selectedDate = event.target.value;
    }

    getCardClass(flight) {
        return flight.Delayed__c
            ? 'slds-box slds-p-around_medium slds-theme_error'
            : 'slds-box slds-p-around_medium slds-theme_default';
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
}