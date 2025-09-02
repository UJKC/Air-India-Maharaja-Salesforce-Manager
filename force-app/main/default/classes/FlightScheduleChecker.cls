global class FlightScheduleChecker implements Schedulable {
    global void execute(SchedulableContext sc) {
        FlightController.checkFlights();
    }
}