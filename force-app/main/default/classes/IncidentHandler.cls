public class IncidentHandler {
    public static void handleBeforeInsert(List<Incident__c> incidents) {
        Set<Id> taskIds = new Set<Id>();
        Set<Id> maintenanceIds = new Set<Id>();

        for (Incident__c incident : incidents) {
            if (incident.Pre_Flight_Task__c != null) {
                taskIds.add(incident.Pre_Flight_Task__c);
            }
            if (incident.Maintenance__c != null) {
                maintenanceIds.add(incident.Maintenance__c);
            }
        }

        // Fetch Pre-Flight Tasks
        Map<Id, Pre_Flight_Task__c> taskMap = new Map<Id, Pre_Flight_Task__c>();
        if (!taskIds.isEmpty()) {
            taskMap = new Map<Id, Pre_Flight_Task__c>(
                [SELECT Id, Flight__c, Aircraft__c, Complete_By__c
                 FROM Pre_Flight_Task__c
                 WHERE Id IN :taskIds]
            );
        }

        // Fetch Maintenance records
        Map<Id, Maintenance__c> maintenanceMap = new Map<Id, Maintenance__c>();
        if (!maintenanceIds.isEmpty()) {
            maintenanceMap = new Map<Id, Maintenance__c>(
                [SELECT Id, Aircraft__c, Maintenance_Date__c
                 FROM Maintenance__c
                 WHERE Id IN :maintenanceIds]
            );
        }

        for (Incident__c incident : incidents) {
            if (incident.Pre_Flight_Task__c != null) {
                Pre_Flight_Task__c task = taskMap.get(incident.Pre_Flight_Task__c);
                if (task != null) {
                    incident.Flight__c = task.Flight__c;
                    incident.Aircraft__c = task.Aircraft__c;
                    incident.Complete_By__c = task.Complete_By__c;
                    incident.Status__c = 'Queued';
                }
            } else if (incident.Maintenance__c != null) {
                Maintenance__c maintenance = maintenanceMap.get(incident.Maintenance__c);
                if (maintenance != null) {
                    incident.Aircraft__c = maintenance.Aircraft__c;
                    incident.Status__c = 'Queued';
                    incident.Complete_By__c = maintenance.Maintenance_Date__c;
                }
            }
        }
    }
}