/**
 * @public
 * Provides formatting functions for the application.
 */
sap.ui.define(
  [
    "nodar/miminoshvili/utils/constants",
    "sap/ui/core/library",
    "sap/base/strings/formatMessage",
  ],
  (Constants, CoreLibrary, MessageFormatter) => {
    "use strict";
    return {
      /**
       * Converts a product status code to a semantic state for UI elements.
       *
       * @public
       * @param {string} sStatus The product status.
       * @returns {sap.ui.core.ValueState} The corresponding semantic value state.
       */
      statusToState(sStatus) {
        switch (sStatus) {
          case Constants.ItemStatus.IN_STOCK:
            return CoreLibrary.ValueState.Success;
          case Constants.ItemStatus.OUT_OF_STOCK:
            return CoreLibrary.ValueState.Warning;
          default:
            return CoreLibrary.ValueState.None;
        }
      },

      /**
       * Formats a message string using the given template and item count.
       *
       * @param {string} sTemplate - The message template containing placeholders.
       * @param {number} iItemCount - The number to insert into the template.
       * @returns {string} The formatted message string.
       * @public
       */
      formatMessage(sTemplate, iItemCount) {
        return MessageFormatter(sTemplate, [iItemCount]);
      },
    };
  }
);
