public with sharing class AircraftController {

    @AuraEnabled(cacheable=true)
    public static Map<String, List<Flight__c>> getAircraftFlights(Id aircraftId) {
        Map<String, List<Flight__c>> result = new Map<String, List<Flight__c>>();

        // Arrivals
        List<Flight__c> arrivals = [
            SELECT Id, Name, Status__c, Start_Airport__r.Name, End_Airport__r.Name,
                   Schedule__c, Destination_Time__c, Delay_banner__c, Delayed__c
            FROM Flight__c
            WHERE End_Airport__c = :aircraftId
            ORDER BY Destination_Time__c DESC
        ];

        // Departures
        List<Flight__c> departures = [
            SELECT Id, Name, Status__c, Start_Airport__r.Name, End_Airport__r.Name,
                   Schedule__c, Destination_Time__c, Delay_banner__c, Delayed__c
            FROM Flight__c
            WHERE Start_Airport__c = :aircraftId
            ORDER BY Schedule__c DESC
        ];

        result.put('arrivals', arrivals);
        result.put('departures', departures);

        return result;
    }

    @AuraEnabled(cacheable=true)
    public static List<Aircraft__c> searchAircraft(String searchKey) {
        if (String.isBlank(searchKey)) return new List<Aircraft__c>();
        searchKey = '%' + String.escapeSingleQuotes(searchKey) + '%';
        return [
            SELECT Id, Name
            FROM Aircraft__c
            WHERE Name LIKE :searchKey
            ORDER BY Name
            LIMIT 10
        ];
    }
}
