trigger FlightTrigger on Flight__c (before insert, before update) {
    if (Trigger.isBefore) {
        if (Trigger.isInsert) {
            FlightTriggerHandler.setFlightNames(Trigger.new, null);
        }
        if (Trigger.isUpdate) {
            FlightTriggerHandler.setFlightNames(Trigger.new, Trigger.oldMap);
        }
    }
}