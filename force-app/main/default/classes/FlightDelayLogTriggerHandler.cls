public class FlightDelayLogTriggerHandler {

    public static void setNames(List<FlightDelayLog__c> newLogs) {
        Set<Id> flightIds = new Set<Id>();

        // Collect related Flight IDs
        for (FlightDelayLog__c log : newLogs) {
            if (log.Flight__c != null) {
                flightIds.add(log.Flight__c);
            }
        }

        if (flightIds.isEmpty()) return;

        // Query related Flights
        Map<Id, Flight__c> flightMap = new Map<Id, Flight__c>(
            [SELECT Id, Name FROM Flight__c WHERE Id IN :flightIds]
        );

        // Update Name field
        for (FlightDelayLog__c log : newLogs) {
            if (log.Flight__c != null && flightMap.containsKey(log.Flight__c)) {
                String flightDescription = flightMap.get(log.Flight__c).Name;
                String timestamp = System.now().format('yyyy-MM-dd HH:mm:ss');
                log.Description__c = flightDescription + ' - ' + timestamp;
            }
        }
    }
}