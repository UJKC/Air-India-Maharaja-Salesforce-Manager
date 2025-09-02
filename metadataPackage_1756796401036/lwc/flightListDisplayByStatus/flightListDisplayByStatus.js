import { LightningElement, track, wire } from 'lwc';
import getFlightsByStatus from '@salesforce/apex/FlightController.getFlightsByStatus';
import { NavigationMixin } from 'lightning/navigation';

export default class FlightListDisplayByStatus extends NavigationMixin(LightningElement) {
    @track flights = [];
    @track selectedStatus = '';
    @track selectedSchedule = null;         // Filter for Schedule__c
    @track selectedDestinationTime = null;  // Filter for Destination_Time__c
    @track error;

    statusOptions = [
        { label: 'All', value: '' },
        { label: 'Security', value: 'Security' },
        { label: 'Pre Flight', value: 'Pre Flight' },
        { label: 'Onboarding', value: 'Onboarding' },
        { label: 'Enroute', value: 'Enroute' },
        { label: 'Reached', value: 'Reached' },
        { label: 'Deboarding', value: 'Deboarding' },
        { label: 'Post Flight Check', value: 'Post Flight Check' },
        { label: 'Cancelled', value: 'Cancelled' },
        { label: 'Delayed', value: 'Delayed' }
    ];

    allFlights = []; // Store server-side fetched flights

    @wire(getFlightsByStatus, { status: '$selectedStatus' })
    wiredFlights({ data, error }) {
        if (data) {
            this.allFlights = data.map(flight => ({
                ...flight,
                AircraftName: flight.Aircraft__r ? flight.Aircraft__r.Name : '',
                StartAirportName: flight.Start_Airport__r ? flight.Start_Airport__r.Name : '',
                EndAirportName: flight.End_Airport__r ? flight.End_Airport__r.Name : ''
            }));
            this.applyClientFilters();
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.flights = undefined;
        }
    }

    handleStatusChange(event) {
        this.selectedStatus = event.detail.value;
    }

    handleScheduleChange(event) {
        this.selectedSchedule = event.detail.value;
        this.applyClientFilters();
    }

    handleDestinationTimeChange(event) {
        this.selectedDestinationTime = event.detail.value;
        this.applyClientFilters();
    }

    applyClientFilters() {
        this.flights = this.allFlights.filter(f => {
            let keep = true;
    
            // Schedule__c filter (compare date only)
            if (this.selectedSchedule && f.Schedule__c) {
                const [y, m, d] = this.selectedSchedule.split('-').map(Number);
                const selectedDate = new Date(y, m - 1, d);
    
                const scheduleDateTime = new Date(f.Schedule__c);
                const scheduleDate = new Date(
                    scheduleDateTime.getFullYear(),
                    scheduleDateTime.getMonth(),
                    scheduleDateTime.getDate()
                );
    
                keep = keep && (scheduleDate >= selectedDate);
            }
    
            // Destination_Time__c filter (compare date only)
            if (this.selectedDestinationTime && f.Destination_Time__c) {
                const [y, m, d] = this.selectedDestinationTime.split('-').map(Number);
                const selectedDestDate = new Date(y, m - 1, d);
    
                const destDateTime = new Date(f.Destination_Time__c);
                const destDate = new Date(
                    destDateTime.getFullYear(),
                    destDateTime.getMonth(),
                    destDateTime.getDate()
                );
    
                keep = keep && (destDate >= selectedDestDate);
            }
    
            return keep;
        });
    }    

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        let recordId;
        switch (actionName) {
            case 'view':
                recordId = row.Id;
                break;
            case 'navigateAircraft':
                recordId = row.Aircraft__c;
                break;
            case 'navigateStartAirport':
                recordId = row.Start_Airport__c;
                break;
            case 'navigateEndAirport':
                recordId = row.End_Airport__c;
                break;
            default:
                return;
        }

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    }

    get columns() {
        return [
            { label: 'Flight Name', fieldName: 'Name', type: 'text' },
            { label: 'Status', fieldName: 'Status__c', type: 'text' },
            {
                label: 'Aircraft',
                type: 'button',
                typeAttributes: {
                    label: { fieldName: 'AircraftName' },
                    name: 'navigateAircraft',
                    variant: 'base'
                }
            },
            {
                label: 'Start Airport',
                type: 'button',
                typeAttributes: {
                    label: { fieldName: 'StartAirportName' },
                    name: 'navigateStartAirport',
                    variant: 'base'
                }
            },
            {
                label: 'End Airport',
                type: 'button',
                typeAttributes: {
                    label: { fieldName: 'EndAirportName' },
                    name: 'navigateEndAirport',
                    variant: 'base'
                }
            },
            { label: 'Schedule', fieldName: 'Schedule__c', type: 'date' },
            { label: 'Destination Time', fieldName: 'Destination_Time__c', type: 'date' },
            {
                type: 'button',
                typeAttributes: {
                    label: 'View',
                    name: 'view',
                    variant: 'brand'
                }
            }
        ];
    }
}
