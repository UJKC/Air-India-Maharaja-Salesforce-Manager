public with sharing class FlightController {
    @AuraEnabled
    public static void flightCancellation(Id flightId) {
        Flight__c flight = [SELECT Id, Status__c FROM Flight__c WHERE Id = :flightId LIMIT 1];
        flight.Status__c = 'Cancelled';
        update flight;
    }

    @AuraEnabled
    public static void updateAircraftAvailability(Id flightId) {
        Flight__c flight = [
            SELECT Id, Status__c, Aircraft__c 
            FROM Flight__c 
            WHERE Id = :flightId 
            LIMIT 1
        ];

        if (flight.Status__c == 'Post Flight Check') {
            Aircraft__c ac = new Aircraft__c(
                Id = flight.Aircraft__c,
                IsAvailable__c = true
            );
            update ac;
        } else {
            throw new AuraHandledException('Flight status is not "Post Flight Check" or no aircraft is linked.');
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Flight__c> getFlightsByStatus(String status) {
        String query = 'SELECT Id, Name, Status__c, Aircraft__r.Name, Start_Airport__r.Name, End_Airport__r.Name, Schedule__c, Destination_Time__c FROM Flight__c';
        if (status != 'Delayed' && !String.isBlank(status)) {
            query += ' WHERE Status__c = :status';
        }
        else if (status == 'Delayed') {
            query += ' WHERE Delayed__c = true';
        }
        return Database.query(query + ' LIMIT 50');
    }

    @AuraEnabled(cacheable=true)
    public static Flight__c getLastTrip(Id aircraftId) {
        return [
            SELECT Id, Name, Start_Airport__r.Name, End_Airport__r.Name,
                   Schedule__c, Destination_Time__c, Status__c, Delayed__c
            FROM Flight__c
            WHERE Aircraft__c = :aircraftId
            ORDER BY Schedule__c DESC
            LIMIT 1
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Flight__c> getAllTrips(Id aircraftId) {
        return [
            SELECT Id, Name, Start_Airport__r.Name, End_Airport__r.Name,
                   Schedule__c, Destination_Time__c, Status__c, Delayed__c
            FROM Flight__c
            WHERE Aircraft__c = :aircraftId
            ORDER BY Schedule__c DESC
        ];
    }

    @AuraEnabled
    public static Flight__c createFlight(Map<String, Object> flightData) {
        try {
            Flight__c flight = new Flight__c();

            flight.Name = (String)flightData.get('Name');
            flight.Status__c = (String)flightData.get('Status__c');
            flight.Aircraft__c = (Id)flightData.get('Aircraft__c');
            flight.Start_Airport__c = (Id)flightData.get('Start_Airport__c');
            flight.End_Airport__c = (Id)flightData.get('End_Airport__c');
            flight.Schedule__c = (Datetime)flightData.get('Schedule__c');
            flight.Destination_Time__c = (Datetime)flightData.get('Destination_Time__c');

            insert flight;
            return flight;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Pre_Flight_Task__c getLatestPreFlightTask(Id flightId) {
        return [
            SELECT Id, Name, Aircraft__c, Complete_By__c, Completed_On__c,
                   Emergency_Equipment__c, Fuel_Checked__c, Instruments_Functional__c,
                   Oil_Level_Checked__c, Tires_And_Brakes__c, Remarks__c
            FROM Pre_Flight_Task__c
            WHERE Flight__c = :flightId
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];
    }
}