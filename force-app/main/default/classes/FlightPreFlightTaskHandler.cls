public class FlightPreFlightTaskHandler {
    public static void handleSecurityStatus(List<Flight__c> newFlights, Map<Id, Flight__c> oldFlightMap) {
        List<Pre_Flight_Task__c> tasksToCreate = new List<Pre_Flight_Task__c>();

        // Replace with your actual Queue ID (starts with 00G)
        Id queueId = '00GdM00000HXLgb'; // <-- Update this with your actual Queue ID

        for (Flight__c flight : newFlights) {
            Flight__c oldFlight = oldFlightMap.get(flight.Id);

            if (flight.Status__c == 'Security') {
                Pre_Flight_Task__c task = new Pre_Flight_Task__c();
                task.Name = flight.Name + ' - Pre-Flight Task';
                task.Flight__c = flight.Id;
                task.Aircraft__c = flight.Aircraft__c;
                task.OwnerId = queueId; // Assign to queue

                // Set Complete_By__c to 20 minutes before Scheduled_Flight__c
                if (flight.Schedule__c != null) {
                    task.Complete_By__c = flight.Schedule__c.addMinutes(-20);
                }

                tasksToCreate.add(task);
            }
        }

        if (!tasksToCreate.isEmpty()) {
            insert tasksToCreate;
        }
    }
    
    public static void handleBeforeUpdate(List<Flight__c> newList, Map<Id, Flight__c> oldMap) {
    Set<Id> flightIdsToCheck = new Set<Id>();

    // Identify flights whose status is changing from "Pre Flight"
    for (Flight__c flight : newList) {
        Flight__c oldFlight = oldMap.get(flight.Id);
        if (oldFlight != null && oldFlight.Status__c == 'Pre Flight' && flight.Status__c != oldFlight.Status__c) {
            flightIdsToCheck.add(flight.Id);
        }
    }

    if (flightIdsToCheck.isEmpty()) return;

    // Fetch related Pre-Flight Tasks
    Map<Id, List<Pre_Flight_Task__c>> flightToTasks = new Map<Id, List<Pre_Flight_Task__c>>();
    for (Pre_Flight_Task__c task : [
        SELECT Id, Flight__c, Emergency_Equipment__c, Fuel_Checked__c,
               Instruments_Functional__c, Oil_Level_Checked__c, Tires_And_Brakes__c
        FROM Pre_Flight_Task__c
        WHERE Flight__c IN :flightIdsToCheck
    ]) {
        if (!flightToTasks.containsKey(task.Flight__c)) {
            flightToTasks.put(task.Flight__c, new List<Pre_Flight_Task__c>());
        }
        flightToTasks.get(task.Flight__c).add(task);
    }

    // Validate that all tasks are completed
    for (Flight__c flight : newList) {
        if (flightIdsToCheck.contains(flight.Id)) {
            Boolean allTasksCompleted = true;
            List<Pre_Flight_Task__c> tasks = flightToTasks.get(flight.Id);

            if (tasks != null) {
                for (Pre_Flight_Task__c task : tasks) {
                    if (!(task.Emergency_Equipment__c &&
                          task.Fuel_Checked__c &&
                          task.Instruments_Functional__c &&
                          task.Oil_Level_Checked__c &&
                          task.Tires_And_Brakes__c)) {
                        allTasksCompleted = false;
                        break;
                    }
                }
            } else {
                allTasksCompleted = false; // No tasks found
            }

            if (!allTasksCompleted && flight.Status__c != 'Cancelled') {
                flight.addError('Cannot change status from "Pre Flight": All Pre-Flight checks must be completed.');
            }
        }
    }
}


}