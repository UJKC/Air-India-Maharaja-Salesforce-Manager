trigger IncidentBeforeUpdate on Incident__c (before update) {
    for (Incident__c incident : Trigger.new) {
        Incident__c oldIncident = Trigger.oldMap.get(incident.Id);

        // Check if status changed to "Resolved"
        if (incident.Status__c == 'Resolved' && oldIncident.Status__c != 'Resolved') {
            incident.Completed_Time__c = System.now();
        }
    }
}