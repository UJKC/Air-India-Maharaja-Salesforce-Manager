trigger IncidentBeforeInsert on Incident__c (before insert) {
    IncidentHandler.handleBeforeInsert(Trigger.new);
}