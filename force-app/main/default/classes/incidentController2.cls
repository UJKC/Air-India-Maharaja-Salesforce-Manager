public with sharing class incidentController2 {
   
@AuraEnabled(cacheable=true)
public static String getRecordTypeName(Id incidentId) {
    Incident__c incident = [
        SELECT RecordType.Name
        FROM Incident__c
        WHERE Id = :incidentId
        LIMIT 1
    ];
    return incident.RecordType.Name;

}
@AuraEnabled(cacheable=true)
public static Aircraft__c getAircraftDetails(Id incidentId) {
    Incident__c incident = [
        SELECT Aircraft__c
        FROM Incident__c
        WHERE Id = :incidentId
        LIMIT 1
    ];

    if (incident.Aircraft__c == null) {
        return null;
    }

    return [
        SELECT Id, Name, Model_Name__c, Manufacturer__c, Capacity__c, Type__c, IsAvailable__c, Next_Scheduled_Maintenance__c
        FROM Aircraft__c
        WHERE Id = :incident.Aircraft__c
    ];
}

    
    @AuraEnabled(cacheable=true)
    public static List<Incident__c> getIncidentsByAircraft(Id incidentId) {
        // Get the Aircraft__c from the given Incident__c record
        Incident__c incident = [
            SELECT Id, Aircraft__c , Complete_By__c FROM Incident__c WHERE Id = :incidentId LIMIT 1
        ];

        // Return all incidents related to that Aircraft
        return [
            SELECT Id, Name, Root_cause_analysis__c, Complete_By__c , Concerned_Issue__c, Status__c, Describe_Incident__c, RecordType.Name
            FROM Incident__c
            WHERE Aircraft__c = :incident.Aircraft__c
            AND Complete_By__c = :incident.Complete_By__c
            AND Id = :incident.Id
            ORDER BY CreatedDate DESC
        ];
    }

    @AuraEnabled
        public static void createIncident2(Id maintenanceId, String description, String issue) {
            
        RecordType rt = [SELECT Id FROM RecordType WHERE SObjectType = 'Incident__c' AND Name = 'maintenance Incident' LIMIT 1];

        Incident__c newIncident = new Incident__c(
            Maintenance__c = maintenanceId,
            Describe_Incident__c = description,
            Concerned_Issue__c = issue,
            RecordTypeId = rt.Id
        );

            insert newIncident;
        }

        
        @AuraEnabled(cacheable=true)
        public static List<Incident__c> getIncidents() {
            return [SELECT Id, Aircraft__r.Name, Concerned_Issue__c, Status__c, Root_cause_analysis__c, Complete_By__c, Completed_Time__c, Describe_Incident__c FROM Incident__c];
        }

@AuraEnabled(cacheable=true)   
public static List<Incident__c> getDueOrOverdueIncidents() {
    return [
        SELECT Id, Aircraft__r.Name, Concerned_Issue__c, Status__c, Complete_By__c
        FROM Incident__c
        WHERE Complete_By__c <= :System.now()
        ORDER BY Complete_By__c ASC
    ];
}


@AuraEnabled(cacheable=true)
public static List<Pre_Flight_Task__c> getPendingPreFlightTasks() {
    return [
        SELECT Id, Name, Complete_By__c,Completed_On__c, Aircraft__r.Name, Flight__r.Name
        FROM Pre_Flight_Task__c
        WHERE Completed_On__c = NULL 
        AND Aircraft__r.Name != NULL 
        AND Flight__r.Name != NULL
        ORDER BY CreatedDate ASC
    ];
}


}