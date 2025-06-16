sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "nodar/miminoshvili/utils/constants",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/MessageToast",
    "nodar/miminoshvili/model/formatter",
  ],

  function (Controller, Constants, ResourceModel, MessageToast, Formatter) {
    "use strict";

    return Controller.extend("nodar.miminoshvili.controller.BaseController", {
      Formatter,

      onInit() {
        const i18nModel = new ResourceModel({
          bundleName: "nodar.miminoshvili.i18n.i18n",
        });
        this.getView().setModel(i18nModel, "i18n");
      },

      onStoreListLinkPress() {
        this.getOwnerComponent().getRouter().navTo(Constants.Routes.STORE_LIST);
      },

      _resetFormFieldErrorStates(oContainer) {
        const aFields = oContainer.findElements(true);

        aFields.forEach((oControl) => {
          if (!oControl.isA("sap.m.Input") && !oControl.isA("sap.m.TextArea")) {
            return;
          }

          oControl.setValueState("None");
        });
      },

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
            oControl.setValueState("None");
          } catch (e) {
            oControl.setValueState("Error");
            oControl.setValueStateText(e.message);
            isValid = false;
          }
        });

        return isValid;
      },

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
