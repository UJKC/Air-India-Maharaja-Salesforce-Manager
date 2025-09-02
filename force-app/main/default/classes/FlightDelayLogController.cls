public with sharing class FlightDelayLogController {
    @AuraEnabled(cacheable=true)
    public static FlightDelayLog__c getLatestDelay(Id flightId) {
        List<FlightDelayLog__c> logs = [
            SELECT Id, Delay_Duration__c, Minute__c, Description__c
            FROM FlightDelayLog__c
            WHERE Flight__c = :flightId
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];
        return logs.isEmpty() ? null : logs[0];
    }

    @AuraEnabled(cacheable=true)
    public static FlightDelayLog__c getLatestDelayLog(Id flightId) {
        FlightDelayLog__c log = [
            SELECT Id, Reason__c
            FROM FlightDelayLog__c
            WHERE Flight__c = :flightId
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];
        return log;
    }

    @AuraEnabled
    public static FlightDelayLog__c updateDelayReason(Id logId, String reason) {
        FlightDelayLog__c log = [SELECT Id, Reason__c FROM FlightDelayLog__c WHERE Id = :logId LIMIT 1];
        log.Reason__c = reason;
        update log;
        return log;
    }
}