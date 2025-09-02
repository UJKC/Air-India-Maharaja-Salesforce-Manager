public with sharing class FlightLogController {
    @AuraEnabled(cacheable=true)
    public static List<Log__c> getLogs(Id flightId) {
        return [
            SELECT Id, Name, Message__c, Stage__c, Timestamp__c
            FROM Log__c
            WHERE Flight__c = :flightId
            ORDER BY Timestamp__c DESC
        ];
    }
}