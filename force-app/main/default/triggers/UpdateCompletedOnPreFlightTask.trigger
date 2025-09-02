trigger UpdateCompletedOnPreFlightTask on Pre_Flight_Task__c (before update) {
    for (Pre_Flight_Task__c task : Trigger.new) {
        if (
            task.Fuel_Checked__c == true &&
            task.Oil_Level_Checked__c == true &&
            task.Tires_And_Brakes__c == true &&
            task.Instruments_Functional__c == true &&
            task.Emergency_Equipment__c == true
        ) {
            task.Completed_On__c = System.now();
        }
    }
}