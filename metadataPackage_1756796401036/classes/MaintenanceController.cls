public with sharing class MaintenanceController {
    @AuraEnabled(cacheable=true)
    public static List<Maintenance__c> getMaintenances(Id aircraftId) {
        return [
            SELECT Id, Name, Maintenance_Date__c, Status__c,
                   Airframe_Inspection__c,
                   Avionics_and_Instruments__c,
                   Cabin_and_Interior__c,
                   Documentation_and_Compliance__c,
                   Electrical_Systems__c,
                   Fire_Protection_and_Safety_Equipment__c,
                   Hydraulic_and_Pneumatic_Systems__c,
                   Powerplant_Engine__c
            FROM Maintenance__c
            WHERE Aircraft__c = :aircraftId
            ORDER BY Maintenance_Date__c DESC
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Maintenance__c getMaintenanceWithAircraft(Id maintenanceId) {
        return [
            SELECT Id, Name, Status__c, Maintenance_Date__c,
                   Aircraft__c, Aircraft__r.Name, Aircraft__r.Model_Name__c, Aircraft__r.Manufacturer__c,
                   Aircraft__r.Capacity__c, Aircraft__r.IsAvailable__c
            FROM Maintenance__c
            WHERE Id = :maintenanceId
            LIMIT 1
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Maintenance__c> getOtherMaintenances(Id maintenanceId) {
        // First get the Aircraft Id for this Maintenance
        Maintenance__c current = [
            SELECT Id, Aircraft__c
            FROM Maintenance__c
            WHERE Id = :maintenanceId
            LIMIT 1
        ];

        if (current.Aircraft__c == null) {
            return new List<Maintenance__c>();
        }

        // Now get all other Maintenances for that Aircraft
        return [
            SELECT Id, Name, Status__c, Maintenance_Date__c,
                   Airframe_Inspection__c, Avionics_and_Instruments__c,
                   Cabin_and_Interior__c, Documentation_and_Compliance__c,
                   Electrical_Systems__c, Fire_Protection_and_Safety_Equipment__c,
                   Hydraulic_and_Pneumatic_Systems__c, Powerplant_Engine__c
            FROM Maintenance__c
            WHERE Aircraft__c = :current.Aircraft__c
            ORDER BY Maintenance_Date__c DESC
        ];
    }
    @AuraEnabled(cacheable=true)
    public static List<Aircraft__c> getAircrafts(String searchKey) {
        try {
            return [SELECT Id, Name FROM Aircraft__c ORDER BY Name];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static Maintenance__c getMaintenanceById(Id recordId) {
        return [
            SELECT Id, Name, Status__c, Aircraft__c, Aircraft__r.Name, 
                   Airframe_Inspection__c, 
                   Avionics_and_Instruments__c,
                   Cabin_and_Interior__c, 
                   Documentation_and_Compliance__c, 
                   Electrical_Systems__c, 
                   Fire_Protection_and_Safety_Equipment__c, 
                   Hydraulic_and_Pneumatic_Systems__c, 
                   Powerplant_Engine__c
            FROM Maintenance__c
            WHERE Id = :recordId
            LIMIT 1
        ];
    }
    @AuraEnabled
    public static Maintenance__c updateMaintenance(Maintenance__c maintenance) {
        update maintenance;
        return maintenance;
    }
    @AuraEnabled(cacheable=true)
    public static List<Maintenance__c> searchMaintenance(String searchKey) {
        String escapedKey = '%' + String.escapeSingleQuotes(searchKey) + '%';
        return [
        SELECT Id, Name, Aircraft__r.Name
        FROM Maintenance__c
        WHERE Name LIKE :escapedKey
        LIMIT 10
        ];
    }  
    @AuraEnabled
    public static Maintenance__c createMaintenance(Id aircraftId, Datetime maintenanceDate) {
        if (aircraftId == null) {
            throw new AuraHandledException('Aircraft must be selected.');
        }

        Maintenance__c m = new Maintenance__c();
        m.Aircraft__c = aircraftId;
        m.Maintenance_Date__c = maintenanceDate;
        m.Status__c = 'Scheduled'; // automatically set
        insert m;

        return m;
    }
}
