
/**
 * @copywrite Alex S. Ducken 2020 <alexducken@gmail.com>
 * @HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 **/
define([], function(){
    //Email List
    const EMAILIDS = [20817];
    const SENDER = 17602;

    //Field types from N/ui/serverWidget
    //See netsuite.com/app/help/helpcenter.nl?fid=section_4332671056.html
    const FIELDTYPES        =   {
        CHECKBOX        :   'CHECKBOX',
        CURRENCY        :   'CURRENCY',
        DATE            :   'DATE',
        DATETIME        :   'DATETIME',
        DATETIMETZ      :   'DATETIMEZ',
        EMAIL           :   'EMAIL',
        FILE            :   'FILE',
        FLOAT           :   'FLOAT',
        HELP            :   'FLOAT',
        INLINEHTML      :   'INLINEHTML',
        INTEGER         :   'INTEGER',
        IMAGE           :   'IMAGE',
        LABEL           :   'LABEL',
        LONGTEXT        :   'LINGTEXT',
        MULTISELECT     :   'MULTISELECT',
        PASSWORD        :   'PASSWORD',
        PERCENT         :   'PERCENT',
        PHONE           :   'PHONE',
        SELECT          :   'SELECT',
        RADIO           :   'RADIO',
        RICHTEXT        :   'RICHTEXT',
        TEXT            :   'TEXT',
        TEXTAREA        :   'TEXTAREA',
        TIMEOFDAY       :   'TIMEOFDAY',
        URL             :   'URL'
    };

    //Fields represented as the objects needed to created them in suitelet.
    //Customer Form Fields
    const  CUSTOMERFIELDS  =   {
        hiddenCustomer  :   {id: 'custpage_hidden_customer', type: FIELDTYPES.SELECT, label: 'Hidden Customer', source: 'customer'},
        serialNumber    :   {id: 'custrecord_wrm_reg_ref_seriallot', type: FIELDTYPES.TEXT, label: 'Serial Number'},
        machine         :   {id: 'custpage_machine_type', label: 'Model', type: FIELDTYPES.TEXT},
        oldCustomer     :   {id: 'custpage_customer_number', type: FIELDTYPES.SELECT, label: 'Customer#', source: 'customer'},
        oldCustPhone    :   {id: 'custpage_customer_phone', type: FIELDTYPES.PHONE, label: 'Customer Phone#'},
        oldCustEmail    :   {id: 'custpage_customer_email', type: FIELDTYPES.EMAIL, label: 'Customer Email'},
        companyName     :   {id: 'custpage_company_name', type: FIELDTYPES.TEXT, label: 'Company Name'},
        mainContact     :   {id: 'custpage_main_contact', type: FIELDTYPES.TEXT, label: 'Main Contact'},
        customerEmail   :   {id: 'custpage_info_email', type: FIELDTYPES.EMAIL, label: 'Customer Email'},
        customerPhone   :   {id: 'custpage_info_phone', type: FIELDTYPES.PHONE, label: 'Customer Phone'},
        customerAddress :   {id: 'custpage_info_address', type: FIELDTYPES.TEXTAREA, label: 'Customer Address'},
        customerCountry :   {id: 'custpage_country', type: FIELDTYPES.SELECT, label: 'Country'},
        customerStreet  :   {id: 'custpage_street_address', type: FIELDTYPES.TEXT, label: 'Street Address'},
        customerSuite   :   {id: 'custpage_suite_address', type: FIELDTYPES.TEXT, label: 'Address Line 2'},
        customerCity    :   {id: 'custpage_city', type: FIELDTYPES.TEXT, label: 'City'},
        customerState   :   {id: 'custpage_state', type: FIELDTYPES.SELECT, label: 'State'},
        customerZip     :   {id: 'custpage_zip', type: FIELDTYPES.TEXT, label: 'ZIP'},
        vehicleVIN      :   {id: 'custpage_vehicle_vin', type: FIELDTYPES.TEXT, label: 'Vehicle Vin#'},
    };

    //Installer Form Fields
    const INSTALLERFIELDS =   {
        elevation       :   {id: 'custpage_elevation', label: 'Elevation Machine Operated', type: FIELDTYPES.INTEGER},
        distributor     :   {id: 'custpage_distributor', label: 'Installing Distributor Name', type: FIELDTYPES.SELECT, source: 'customer'},
        distributorAdd  :   {id: 'custpage_distributorlocation', label: 'Distributor Location', type: FIELDTYPES.TEXT},
        installerName   :   {id: 'custpage_name', label: 'Installer\'s Name', type: FIELDTYPES.TEXT},
        testDate        :   {id: 'custpage_test_date', label: 'Test Date', type: FIELDTYPES.DATE},
        engineOil       :   {id: 'custpage_oil_engine', label: 'Engine Oil Level', type: FIELDTYPES.SELECT, source: 'customlist_oil_levels'},
        oilBlower       :   {id: 'custpage_oil_blower', label: 'Blower Oil Level', type: FIELDTYPES.SELECT, source: 'customlist_oil_levels'},
        oilPump         :   {id: 'custpage_oil_pump', label: 'Pump Oil Level', type: FIELDTYPES.SELECT, source: 'customlist_oil_levels'},
        connections     :   {id: 'custpage_connections', label: 'Connections', type: FIELDTYPES.MULTISELECT, source: 'customlist_connections'},
        leaks           :   {id: 'custpage_leaks', label: 'Leaks', type: FIELDTYPES.MULTISELECT, source: 'customlist_leaks'},
        valve           :   {id: 'custpage_valve', label: 'Diverter Valve', type: FIELDTYPES.SELECT, source: 'customlist_valves'},
        beltsPulleys    :   {id: 'custpage_belts_plus', label: 'Pulleys/Belts', type: FIELDTYPES.SELECT, source: 'customlist_belts'},
        hourMeter       :   {id: 'custpage_hour_meter', label: 'Hour Meter Reading', type: FIELDTYPES.FLOAT},
        waterBox        :   {id: 'custpage_water_box', label: 'Water Box Float', type: FIELDTYPES.SELECT, source: 'customlist_fail_safe'},
        recoveryTank    :   {id: 'custpage_recovery_tank', label: 'Recovery Tank Float', type: FIELDTYPES.SELECT, source: 'customlist_fail_safe'},
        pumpOut         :   {id: 'custpage_pump_out', label: 'Pump Out Float', type: FIELDTYPES.SELECT, source: 'customlist_fail_safe'},
        chemMeter       :   {id: 'custpage_chem_meter', label: 'Chemical Flow Meter', type: FIELDTYPES.SELECT, source: 'customlist_fail_safe'},
        blowerRpm       :   {id: 'custpage_blower_rpm', label: 'Blower RPM', type: FIELDTYPES.FLOAT},
        engineRpm       :   {id: 'custpage_engine_rpm', label: 'Engine RPM', type: FIELDTYPES.FLOAT},
        highPressure    :   {id: 'custpage_high_pressure', label: 'High Pressure Setting', type: FIELDTYPES.TEXT},
        vacuumSetting   :   {id: 'custpage_vacuum_setting', label: 'Vacuum Setting Maximum', type: FIELDTYPES.TEXT},
        tempNoFlow      :   {id: 'custpage_temp_noflow', label: 'Temperature 100 Hose No Flow', type: FIELDTYPES.FLOAT},
        tempContin      :   {id: 'custpage_temp_contin', label: 'Temperature 100 Hose Continuous', type: FIELDTYPES.FLOAT},
        make            :   {id: 'custpage_make', label: 'Make', type: FIELDTYPES.TEXT},
        model           :   {id: 'custpage_model', label: 'Model', type: FIELDTYPES.TEXT},
        engineYear      :   {id: 'custpage_engine_year', label: 'Year', type: FIELDTYPES.TEXT},
        engine          :   {id: 'custpage_engine', label: 'Engine', type: FIELDTYPES.TEXT},
        fuelSystem      :   {id: 'custpage_fuel_system', label: 'Fuel System', type: FIELDTYPES.SELECT, source: 'customlist_gas_diesel'},
        roofVents       :   {id: 'custpage_roof_vents', label: 'Roof Vents', type: FIELDTYPES.CHECKBOX},
        installComments :   {id: 'custpage_installer_comments', label: 'Installer Comments', type: FIELDTYPES.TEXTAREA},
        mounted         :   {id: 'custpage_mounted', label: 'Securely Mounted System', type: FIELDTYPES.CHECKBOX},
        guideProvided   :   {id: 'custpage_guide_provided', label: 'Manual and Warnings Provided', type: FIELDTYPES.CHECKBOX},
        installerTrain  :   {id: 'custpage_trained', label: 'Installer Trained', type: FIELDTYPES.CHECKBOX},
        freshWater      :   {id: 'custpage_fresh_water', label: 'Fresh Water Installed Correctly', type: FIELDTYPES.CHECKBOX},
        fuelInstaller   :   {id: 'custpage_fuel_install', label: 'Fuel Installed Correctly', type: FIELDTYPES.CHECKBOX},
        compliantHM     :   {id: 'custpage_machine_install', label: 'Machine Install Compliant', type: FIELDTYPES.CHECKBOX},
        compliantLocal  :   {id: 'custpage_local_codes', label: 'Install Code Compliant', type: FIELDTYPES.CHECKBOX},
        unitFunctional  :   {id: 'custpage_unit_functional', label: 'Unit Delivered Functional', type: FIELDTYPES.CHECKBOX},
    };

    //Rewards form fields
    const REWARDSFIELDS       =   {
        performanceIns  :   {id: 'custpage_customer_comments', label: 'Rate Installer 1-10', type: FIELDTYPES.INTEGER},
        chemicalKit     :   {id: 'custpage_chemical_kit', label: 'Chemical Kit', type: FIELDTYPES.CHECKBOX},
        jacket          :   {id: 'custpage_jacket', label: 'Jacket', type: FIELDTYPES.CHECKBOX},
        jacketSize      :   {id: 'custpage_jacket_size', label: 'Jacket Size', type: FIELDTYPES.SELECT, source: 'customlist_jacket_size'},
        decal           :   {id: 'custpage_decal', label: 'Decal', type: FIELDTYPES.CHECKBOX},
    };

    //Fields for entry select form
    const ENTRYSELECT         =   {
        formSelect      :   {id: 'custpage_form_select', label: 'Form Select', type: FIELDTYPES.SELECT},
        installDate     :   {id: 'custpage_install_date', label: 'Installation Date', type: FIELDTYPES.DATE}
    };

    return{
        //Field Collections
        customerFields  :   CUSTOMERFIELDS,
        installerFields :   INSTALLERFIELDS,
        rewardsFields   :   REWARDSFIELDS,
        entrySelect     :   ENTRYSELECT,
        emailIds        :   EMAILIDS,
        sender          :   SENDER,

        //returning the field groups as arrays to be added to suitelet.
        customerMacine  :   [CUSTOMERFIELDS.hiddenCustomer, CUSTOMERFIELDS.serialNumber, CUSTOMERFIELDS.machine],
        oldCustomer     :   [CUSTOMERFIELDS.oldCustomer, CUSTOMERFIELDS.oldCustPhone, CUSTOMERFIELDS.oldCustEmail],
        customerInfo    :   [CUSTOMERFIELDS.companyName, CUSTOMERFIELDS.mainContact, CUSTOMERFIELDS.customerEmail, CUSTOMERFIELDS.customerPhone, CUSTOMERFIELDS.customerAddress,
            CUSTOMERFIELDS.customerCountry, CUSTOMERFIELDS.customerStreet, CUSTOMERFIELDS.customerSuite, CUSTOMERFIELDS.customerCity, CUSTOMERFIELDS.customerState, CUSTOMERFIELDS.customerZip],
        installerInfo   :   [INSTALLERFIELDS.distributor, INSTALLERFIELDS.distributorAdd, INSTALLERFIELDS.installerName],
        installerCheck  :   [INSTALLERFIELDS.testDate, INSTALLERFIELDS.engineOil, INSTALLERFIELDS.oilBlower, INSTALLERFIELDS.oilPump,
            INSTALLERFIELDS.connections, INSTALLERFIELDS.leaks, INSTALLERFIELDS.valve, INSTALLERFIELDS.beltsPulleys, INSTALLERFIELDS.hourMeter, INSTALLERFIELDS.waterBox, INSTALLERFIELDS.recoveryTank,
            INSTALLERFIELDS.pumpOut, INSTALLERFIELDS.chemMeter, INSTALLERFIELDS.blowerRpm, INSTALLERFIELDS.engineRpm, INSTALLERFIELDS.highPressure, INSTALLERFIELDS.vacuumSetting,
            INSTALLERFIELDS.tempNoFlow, INSTALLERFIELDS.tempContin, INSTALLERFIELDS.elevation],
        vehicleInfo     :   [INSTALLERFIELDS.make, INSTALLERFIELDS.model, INSTALLERFIELDS.engineYear, INSTALLERFIELDS.engine, INSTALLERFIELDS.fuelSystem, INSTALLERFIELDS.roofVents, INSTALLERFIELDS.installComments],
        certificates    :   [INSTALLERFIELDS.mounted, INSTALLERFIELDS.guideProvided, INSTALLERFIELDS.installerTrain, INSTALLERFIELDS.freshWater, INSTALLERFIELDS.fuelInstaller, INSTALLERFIELDS.compliantHM,
            INSTALLERFIELDS.compliantLocal, INSTALLERFIELDS.unitFunctional],
        rewards         :   [REWARDSFIELDS.performanceIns, REWARDSFIELDS.chemicalKit, REWARDSFIELDS.jacket, REWARDSFIELDS.jacketSize, REWARDSFIELDS.decal],
        validateCust    :   [CUSTOMERFIELDS.serialNumber, CUSTOMERFIELDS.companyName, CUSTOMERFIELDS.customerEmail, CUSTOMERFIELDS.machine, CUSTOMERFIELDS.mainContact, CUSTOMERFIELDS.customerPhone],
        validateInst    :   [INSTALLERFIELDS.distributor, INSTALLERFIELDS.installerName],
        validateReward  :   [REWARDSFIELDS.jacket, REWARDSFIELDS.jacketSize, REWARDSFIELDS.chemicalKit],
        entry           :   [CUSTOMERFIELDS.serialNumber, ENTRYSELECT.formSelect, CUSTOMERFIELDS.vehicleVIN, ENTRYSELECT.installDate]
    };
});