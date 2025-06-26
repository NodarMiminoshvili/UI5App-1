sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "nodar/miminoshvili/utils/constants",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/MessageToast",
    "nodar/miminoshvili/model/formatter",
    "sap/ui/core/library",
  ],

  function (
    Controller,
    Constants,
    ResourceModel,
    MessageToast,
    Formatter,
    CoreLibrary
  ) {
    "use strict";

    return Controller.extend("nodar.miminoshvili.controller.BaseController", {
      Formatter,

      /**
       * Called when the controller is initialized.
       * Sets the i18n model to the view.
       * @public
       */
      onInit() {
        const i18nModel = new ResourceModel({
          bundleName: "nodar.miminoshvili.i18n.i18n",
        });
        this.getView().setModel(i18nModel, "i18n");
      },

      /**
       * Navigates to the Store List view using the router.
       * @public
       */
      onStoreListLinkPress() {
        this.getOwnerComponent().getRouter().navTo(Constants.Routes.STORE_LIST);
      },

      /**
       * Resets the value state of all input and text area fields inside a container.
       * @param {sap.ui.core.Control} oContainer The control container to search for form fields.
       * @private
       */
      _resetFormFieldErrorStates(oContainer) {
        const aFields = oContainer.findElements(true);

        aFields.forEach((oControl) => {
          if (!oControl.isA("sap.m.Input") && !oControl.isA("sap.m.TextArea")) {
            return;
          }

          oControl.setValueState("None");
        });
      },

      /**
       * Validates all input and text area fields inside a container.
       * Sets value states based on validation results.
       * @param {sap.ui.core.Control} oContainer The control container to validate.
       * @returns {boolean} True if all fields are valid; otherwise false or void.
       * @private
       */
      _validateFormFields(oContainer) {
        const aFields = oContainer.findElements(true);
        let isValid = true;

        aFields.forEach((oControl) => {
          if (!oControl.isA("sap.m.Input") && !oControl.isA("sap.m.TextArea")) {
            return;
          }

          const oBinding = oControl.getBinding("value");

          if (
            !oBinding ||
            !oBinding.getType() ||
            !oBinding.getType().validateValue
          ) {
            return;
          }

          try {
            oBinding.getType().validateValue(oControl.getValue());
            oControl.setValueState(CoreLibrary.ValueState.None);
          } catch (e) {
            oControl.setValueState(CoreLibrary.ValueState.Error);
            oControl.setValueStateText(e.message);
            isValid = false;
          }
        });

        return isValid;
      },

      /**
       * Retrieves a localized text string from the i18n resource bundle.
       * @param {string} sRequestedTextKey The text key to look up.
       * @param {string[]} [aParams] Optional array of parameters for placeholder substitution.
       * @returns {Promise<string>} The resolved localized text.
       * @private
       */
      async _getText(sRequestedTextKey, aParams) {
        const oBundle = await this.getView()
          .getModel("i18n")
          .getResourceBundle();

        return oBundle.getText(sRequestedTextKey, aParams);
      },

      async _displayToast(sRequestedTextKey) {
        const sTextToDisplay = await this._getText(sRequestedTextKey);
        MessageToast.show(sTextToDisplay);
      },
    });
  }
);
