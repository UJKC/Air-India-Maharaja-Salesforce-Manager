public class FlightTriggerHandler {

    public static void setFlightNames(List<Flight__c> newFlights, Map<Id, Flight__c> oldMap) {
        if (newFlights == null || newFlights.isEmpty()) return;

        Set<Id> airportIds = new Set<Id>();
        Set<Id> aircraftIds = new Set<Id>();
        List<Aircraft__c> aircraftToUpdate = new List<Aircraft__c>();

        try {
            // Collect Airport and Aircraft Ids
            for (Flight__c flight : newFlights) {
                if (flight.Start_Airport__c != null) airportIds.add(flight.Start_Airport__c);
                if (flight.End_Airport__c != null) airportIds.add(flight.End_Airport__c);
                if (flight.Aircraft__c != null) aircraftIds.add(flight.Aircraft__c);
            }

            // Fetch Airports
            Map<Id, Airport__c> airportMap = new Map<Id, Airport__c>();
            if (!airportIds.isEmpty()) {
                airportMap = new Map<Id, Airport__c>(
                    [SELECT Id, Name FROM Airport__c WHERE Id IN :airportIds]
                );
            }

            // Fetch Aircraft availability
            Map<Id, Aircraft__c> aircraftMap = new Map<Id, Aircraft__c>();
            if (!aircraftIds.isEmpty()) {
                aircraftMap = new Map<Id, Aircraft__c>(
                    [SELECT Id, IsAvailable__c FROM Aircraft__c WHERE Id IN :aircraftIds]
                );
            }

            for (Flight__c flight : newFlights) {
                try {
                    String startWord = '';
                    String endWord = '';
                    String formattedTime = '';

                    // Prevent same start and end airport
                    if (flight.Start_Airport__c != null && flight.End_Airport__c != null &&
                        flight.Start_Airport__c == flight.End_Airport__c) {
                        flight.addError('Start and End Airport cannot be the same.');
                        continue;
                    }

                    // Flight naming logic
                    if (flight.Start_Airport__c != null && airportMap.containsKey(flight.Start_Airport__c)) {
                        startWord = airportMap.get(flight.Start_Airport__c).Name.split(' ')[0];
                    }
                    if (flight.End_Airport__c != null && airportMap.containsKey(flight.End_Airport__c)) {
                        endWord = airportMap.get(flight.End_Airport__c).Name.split(' ')[0];
                    }
                    if (flight.Schedule__c != null) {
                        formattedTime = flight.Schedule__c.format('dd-MM-yyyy h:mma');
                    }
                    flight.Name = 'Air India - ' + startWord + ' to ' + endWord + ' - ' + formattedTime;

                    // Aircraft availability and continuity logic
                    if (flight.Aircraft__c != null && aircraftMap.containsKey(flight.Aircraft__c)) {
                        Aircraft__c relatedAircraft = aircraftMap.get(flight.Aircraft__c);

                        // INSERT logic (new flight creation)
                        if (oldMap == null) {
                            Boolean canAssign = false;

                            if (relatedAircraft.IsAvailable__c == true) {
                                canAssign = true;
                            } else {
                                // Check continuity
                                List<Flight__c> existingFlights = [
                                    SELECT Id, Destination_Time__c, End_Airport__c
                                    FROM Flight__c
                                    WHERE Aircraft__c = :flight.Aircraft__c
                                    AND Destination_Time__c != null
                                    ORDER BY Destination_Time__c DESC
                                    LIMIT 1
                                ];

                                if (!existingFlights.isEmpty() && flight.Schedule__c != null && flight.Start_Airport__c != null) {
                                    Flight__c lastFlight = existingFlights[0];
                                    DateTime lastDestinationTime = lastFlight.Destination_Time__c;
                                    DateTime newDepartureTime = flight.Schedule__c;

                                    if (lastFlight.End_Airport__c != flight.Start_Airport__c) {
                                        flight.addError('The new flight must start from the same airport where the last flight ended for this aircraft.');
                                        continue;
                                    }

                                    if (lastDestinationTime.addHours(2) <= newDepartureTime) {
                                        canAssign = true;
                                    }
                                }
                            }

                            if (canAssign) {
                                relatedAircraft.IsAvailable__c = false;
                                aircraftToUpdate.add(relatedAircraft);
                            } else {
                                if (flight.getErrors().isEmpty()) {
                                    flight.addError('This Aircraft is unavailable or does not meet the 2-hour buffer requirement.');
                                }
                            }
                        }
                        // UPDATE logic (status update)
                        else {
                            Flight__c oldFlight = oldMap.get(flight.Id);
                            if (oldFlight != null && oldFlight.Status__c != 'Post Flight Check' 
                                && (flight.Status__c == 'Post Flight Check' || flight.Status__c == 'Cancelled')) {
                                relatedAircraft.IsAvailable__c = true;
                                aircraftToUpdate.add(relatedAircraft);
                            }
                        }
                    }

                } catch (Exception innerEx) {
                    flight.addError('Error processing flight: ' + innerEx.getMessage());
                }
            }

            if (!aircraftToUpdate.isEmpty()) {
                try {
                    update aircraftToUpdate;
                } catch (DmlException dmle) {
                    for (Aircraft__c a : aircraftToUpdate) {
                        // Log error to debug or add custom error handling
                        System.debug('Error updating Aircraft Id ' + a.Id + ': ' + dmle.getMessage());
                    }
                    throw dmle; // rethrow if needed
                }
            }

        } catch (Exception ex) {
            System.debug('Error in setFlightNames: ' + ex.getMessage());
            // Optionally, you can throw a custom exception or just log
            throw new AuraHandledException('Unexpected error while processing flights: ' + ex.getMessage());
        }
    }
}