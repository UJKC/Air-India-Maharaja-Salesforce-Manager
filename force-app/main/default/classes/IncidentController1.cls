public with sharing class IncidentController1 {
    @AuraEnabled(cacheable=true)
    public static List<Incident__c> getIncidents(Id flightId) {
        return [
            SELECT Id, Name, Status__c, Describe_Incident__c, CreatedDate
FROM Incident__c
WHERE Flight__c = :flightId
   OR Pre_Flight_Task__r.Flight__c = :flightId
ORDER BY CreatedDate DESC
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Incident__c> getAircraftIncidents(Id aircraftId) {
        return [
            SELECT Id, Name, Status__c, Describe_Incident__c,
                   Maintenance__c, Pre_Flight_Task__c, CreatedDate
            FROM Incident__c
            WHERE Aircraft__c = :aircraftId
              AND (Maintenance__c != null OR Pre_Flight_Task__c != null)
            ORDER BY CreatedDate DESC
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Incident__c> getIncidentsByMaintenance(Id maintenanceId) {
        return [
            SELECT Id, Name, Status__c, CreatedDate
            FROM Incident__c
            WHERE Maintenance__c = :maintenanceId
            AND RecordTypeId = '012dM00000930fpQAA'
            ORDER BY CreatedDate DESC
            LIMIT 50
        ];
    }
    @AuraEnabled(cacheable=true)
    public static List<Incident__c> searchIncidents(String searchKey) {
        if (String.isBlank(searchKey)) return new List<Incident__c>();
        
        String escapedKey = '%' + String.escapeSingleQuotes(searchKey) + '%';
        return [
            SELECT Id, Name
            FROM Incident__c
            WHERE Name LIKE :escapedKey
            ORDER BY CreatedDate DESC
            LIMIT 50
        ];
    }
    @AuraEnabled(cacheable=true)
    public static Incident__c getSearchedIncidents(Id recordId) {
        return [SELECT Id, Name, Status__c, Root_cause_analysis__c 
        FROM Incident__c
        WHERE Id =: recordId
        LIMIT 1];
    }

    @AuraEnabled
    public static void updateIncidents(Incident__c incidentId) {
        update incidentId;
    }
}