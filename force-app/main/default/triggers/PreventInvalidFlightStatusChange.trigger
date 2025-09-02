trigger PreventInvalidFlightStatusChange on Flight__c (before update) {
    Set<String> restrictedStatuses = new Set<String>{
        'Post Flight Check', 'Enroute', 'Reached', 'Deboarding'
    };

    for (Flight__c newFlight : Trigger.new) {
        Flight__c oldFlight = Trigger.oldMap.get(newFlight.Id);

        if (restrictedStatuses.contains(oldFlight.Status__c) &&
            newFlight.Status__c == 'Cancelled') {
            newFlight.addError('You cannot change the status from "' + oldFlight.Status__c + '" to "Cancelled".');
        }
    }
}