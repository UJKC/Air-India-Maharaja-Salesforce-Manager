public with sharing class PreFlightController {

    @AuraEnabled(cacheable=true)
    public static Pre_Flight_Task__c getTaskWithFlight(Id taskId) { 
        return [        
            SELECT Id, Name,
                   Flight__r.Id, Flight__r.Name,
                   Flight__r.Schedule__c,
                   Flight__r.Flight_Type__c,
                   Flight__r.Status__c,
                   Aircraft__r.Name,
                   Flight__r.Destination_Time__c,
                   Flight__r.Delayed__c
            FROM Pre_Flight_Task__c
            WHERE Id = :taskId
            LIMIT 1
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Incident__c> getIncidentsForTask(Id taskId) {
        return [
            SELECT Id, Name , Flight__r.Name, Pre_Flight_Task__c, Aircraft__r.Name,Describe_Incident__c,
                   Concerned_Issue__c, Status__c, Root_cause_analysis__c
            FROM Incident__c
            WHERE Pre_Flight_Task__c = :taskId
        ];
    }

    
        @AuraEnabled
        public static void createIncident(Id preFlightTaskId, String description, String issue) {
            
        RecordType rt = [SELECT Id FROM RecordType WHERE SObjectType = 'Incident__c' AND Name = 'Pre Flight Incident' LIMIT 1];

        Incident__c newIncident = new Incident__c(
            Pre_Flight_Task__c = preFlightTaskId,
            Describe_Incident__c = description,
            Concerned_Issue__c = issue,
            RecordTypeId = rt.Id
        );

            insert newIncident;
        }

        @AuraEnabled(cacheable=true)
        public static List<Incident__c> getIncidentsByAircraft(Id preFlightTaskId) {
        // Get Aircraft__c from the current Pre_Flight_Task__c
        Pre_Flight_Task__c task = [
            SELECT Aircraft__c FROM Pre_Flight_Task__c WHERE Id = :preFlightTaskId
        ];

        // Fetch related incidents
        return [
            SELECT Id, Root_cause_analysis__c, Concerned_Issue__c, Status__c, Describe_Incident__c ,Complete_By__c
            FROM Incident__c
            WHERE Aircraft__c = :task.Aircraft__c AND
            Complete_By__c = :task.Complete_By__c
        ];
    }

    

    @AuraEnabled(cacheable=true)
    public static Aircraft__c getAircraftFromTask(Id preFlightTaskId) {
        Pre_Flight_Task__c task = [
            SELECT Aircraft__c, Aircraft__r.Name, Aircraft__r.Type__c, Aircraft__r.Capacity__c,
                   Aircraft__r.Next_Scheduled_Maintenance__c, Aircraft__r.Manufacturer__c, Aircraft__r.Model_Name__c
            FROM Pre_Flight_Task__c
            WHERE Id = :preFlightTaskId
            LIMIT 1
        ];

        return task.Aircraft__r;
    }

}