trigger FlightPreFlightTaskTrigger on Flight__c (after update, before update) {
    if (Trigger.isAfter && Trigger.isUpdate) {
        FlightPreFlightTaskHandler.handleSecurityStatus(Trigger.new, Trigger.oldMap);
    }
    else if (Trigger.isBefore && Trigger.isUpdate) {
        FlightPreFlightTaskHandler.handleBeforeUpdate(Trigger.new, Trigger.oldMap);
        TestCalss.Main(Trigger.new, Trigger.oldMap);
    }
}