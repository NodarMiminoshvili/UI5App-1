/**
 * @public
 * Provides formatting functions for the application.
 */
sap.ui.define(["nodar/miminoshvili/utils/Constants"], function (Constants) {
  "use strict";
  return {
    /**
     * Converts a product status code to a semantic state for UI elements.
     *
     * @public
     * @param {string} sStatus The product status code.
     * @returns {sap.ui.core.ValueState} The corresponding semantic value state.
     */
    statusToState(sStatus) {
      switch (sStatus) {
        case "In Stock":
          return "Success";
        case "Out of Stock":
          return "Warning";
        default:
          return "None";
      }
    },

    /**
     * Determines the appropriate icon for the sort button based on the current sort state.
     *
     * @public
     * @param {string} sField The field being considered for sorting.
     * @param {object} oSortState An object containing the currently sorted field (`sField`) and sort direction (`bDescending`).
     * @param {string} oSortState.sField The currently sorted field.
     * @param {boolean} oSortState.bDescending Whether the current sort direction is descending.
     * @returns {string} The URI of the icon to display.
     */
    formatSortIcon(sField, oSortState) {
      if (oSortState.sField !== sField) {
        return "sap-icon://sort";
      }

      return oSortState.bDescending
        ? Constants.Icons.SORT_DESC
        : Constants.Icons.SORT_ASC;
    },
  };
});
