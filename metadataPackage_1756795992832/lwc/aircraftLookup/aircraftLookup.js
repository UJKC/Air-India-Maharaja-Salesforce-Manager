import { LightningElement, track } from 'lwc';
import searchAircraft from '@salesforce/apex/AircraftController.searchAircraft';

export default class AircraftLookup extends LightningElement {
    @track searchKey = '';
    @track results = [];

    handleSearchKeyChange(event) {
        this.searchKey = event.target.value;

        if (this.searchKey.length > 1) { // search only if more than 1 char
            searchAircraft({ searchKey: this.searchKey })
                .then(res => {
                    this.results = res;
                })
                .catch(error => {
                    console.error(error);
                    this.results = [];
                });
        } else {
            this.results = [];
        }
    }

    handleSelect(event) {
        const selectedAircraft = {
            Id: event.target.dataset.id,
            Name: event.target.dataset.name
        };
        // Fire custom event to parent
        this.dispatchEvent(new CustomEvent('aircraftselect', { detail: selectedAircraft }));

        // Clear the results and set searchKey to selected Name
        this.results = [];
        this.searchKey = selectedAircraft.Name;
    }
}
