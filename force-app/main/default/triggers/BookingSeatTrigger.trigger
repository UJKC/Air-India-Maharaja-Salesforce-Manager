trigger BookingSeatTrigger on Booking_Seat__c (before insert) {
    Set<Id> flightIds = new Set<Id>();
    for (Booking_Seat__c seat : Trigger.new) {
        if (seat.Flight__c != null) {
            flightIds.add(seat.Flight__c);
        }
    }

    Map<Id, Flight__c> flightMap = new Map<Id, Flight__c>(
        [SELECT Id, Aircraft__c, 
                (SELECT Id FROM Booking_Seats__r),
                Aircraft__r.Capacity__c 
         FROM Flight__c 
         WHERE Id IN :flightIds]
    );

    for (Booking_Seat__c seat : Trigger.new) {
        if (seat.Flight__c != null) {
            Flight__c flight = flightMap.get(seat.Flight__c);
            Integer currentBookings = flight.Booking_Seats__r.size();
            Decimal capacity = flight.Aircraft__r.Capacity__c;

            if (currentBookings >= capacity) {
                seat.addError('Cannot book seat: Aircraft capacity is full.');
            }
        }
    }
}