trigger FlightDelayLogTrigger on FlightDelayLog__c (before insert) {
    if (Trigger.isBefore && Trigger.isInsert) {
        FlightDelayLogTriggerHandler.setNames(Trigger.new);
    }
}