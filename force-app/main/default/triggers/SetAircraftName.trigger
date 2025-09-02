trigger SetAircraftName on Aircraft__c (before insert) {
    // Get the current count of Aircraft__c records
    Integer existingCount = [SELECT COUNT() FROM Aircraft__c];

    Integer counter = existingCount + 1;

    for (Aircraft__c aircraft : Trigger.new) {
        aircraft.Name = aircraft.Model_Name__c + ' #' + counter;
        counter++;
    }
}