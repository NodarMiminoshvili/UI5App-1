/**
 * @module utils/Constants
 * @description Defines application-wide constants for routes and icons.
 * @public
 */
sap.ui.define([], function () {
  "use strict";

  return {
    /**
     * Route name constants used for navigation.
     * @enum {string}
     */
    Routes: {
      CAR_DETAILS: "CarDetails",
      CAR_LIST: "CarList",
    },

    /**
     * Icon URI constants for sorting buttons.
     * @enum {string}
     */
    Icons: {
      SORT_NONE: "sap-icon://sort",
      SORT_ASC: "sap-icon://sort-ascending",
      SORT_DESC: "sap-icon://sort-descending",
    },
  };
});
