/**
 * @public
 * Provides formatting functions for the application.
 */
sap.ui.define(
  ["sap/ui/core/library", "sap/base/strings/formatMessage"],
  (CoreLibrary, MessageFormatter) => {
    "use strict";
    return {
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

      /**
       * Formats a product name and ID.
       *
       * @param {string[]} aMessageParts - An array of message parts, containing the product name and ID.
       * @returns {Promise<string>} A promise that resolves to the formatted string.
       * @public
       */
      async formatNameAndId(...aMessageParts) {
        return await this._getText("productNameAndId", aMessageParts);
      },

      /**
       * Formats the discontinued date of a product.
       * If the date is provided, it's returned as is; otherwise, a localized "in production" state message is returned.
       *
       * @param {string} sDiscontinuedDate - The discontinued date string.
       * @returns {Promise<string>} A promise that resolves to the formatted date or a localized "in production" message.
       * @public
       */
      async formatDiscontinuedDate(sDiscontinuedDate) {
        return sDiscontinuedDate
          ? sDiscontinuedDate
          : await this._getText("inProductionState");
      },

      /**
       * Determines the UI state based on the discontinued date.
       * Returns 'Warning' if a discontinued date is provided, otherwise returns 'Success'.
       *
       * @param {string} sDiscontinuedDate - The discontinued date string.
       * @returns {sap.ui.core.ValueState} The UI state.
       * @public
       */
      async dateToState(sDiscontinuedDate) {
        return sDiscontinuedDate
          ? CoreLibrary.ValueState.Warning
          : CoreLibrary.ValueState.Success;
      },
    };
  }
);
