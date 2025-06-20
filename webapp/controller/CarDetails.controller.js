sap.ui.define(
  [
    "nodar/miminoshvili/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "nodar/miminoshvili/utils/constants",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Sorter",
  ],

  (BaseController, JSONModel, Constants, MessageBox, MessageToast, Sorter) => {
    "use strict";

    return BaseController.extend("nodar.miminoshvili.controller.CarDetails", {
      /**
       * Initializes the controller and sets up the route pattern handler.
       * @public
       */
      onInit() {
        this.getOwnerComponent()
          .getRouter()
          .getRoute(Constants.Routes.CAR_DETAILS)
          .attachPatternMatched(this.onPatternMatched.bind(this));
      },

      /**
       * Triggered when the route pattern is matched. Loads car details into the view model.
       * @param {sap.ui.base.Event} oEvent Route event containing the carId parameter.
       * @public
       */
      onPatternMatched(oEvent) {
        const { carId: sCarId } = oEvent.getParameter("arguments");

        const {
          Cars: aCars,
          MaintenanceHistorySet: aMaintenanceHistorySet,
          Categories,
          Suppliers,
        } = this.getOwnerComponent().getModel().getData();

        const oSelectedCar = aCars.find((car) => car.ID === sCarId);
        const aSelectedCarMaintenanceHistory = aMaintenanceHistorySet.filter(
          (set) => set.CarID === sCarId
        );

        const oCarModel = {
          Car: oSelectedCar,
          MaintenanceHistory: aSelectedCarMaintenanceHistory,
          Categories,
          Suppliers,
          EditMode: false,
        };

        const oModel = new JSONModel(oCarModel);
        this.getView().setModel(oModel);
      },

      /**
       * Enables edit mode and stores the current car state in `/EditedCar`.
       * @public
       */
      handleEditPress() {
        this._toggleEditMode(true);
        const oModel = this.getView().getModel();
        const oCarBeforeEdit = oModel.getProperty("/Car");
        oModel.setProperty("/EditedCar", { ...oCarBeforeEdit });
      },

      /**
       * Cancels editing by disabling edit mode.
       * @public
       */
      handleCancelPress() {
        this._toggleEditMode(false);
      },

      /**
       * Validates the form and saves edited car data if valid.
       * @public
       */
      handleSavePress() {
        const bIsValid = this._validateFormFields(this.byId("form"));
        if (!bIsValid) return;

        this._toggleEditMode(false);

        const oEditedCar = this.getView().getModel().getProperty("/EditedCar");
        this.getView().getModel().setProperty("/Car", oEditedCar);

        const aUpdatedCars = this.getOwnerComponent()
          .getModel()
          .getProperty("/Cars")
          .map((car) => (car.ID === oEditedCar.ID ? oEditedCar : car));

        this.getOwnerComponent().getModel().setProperty("/Cars", aUpdatedCars);
      },

      /**
       * Prompts deletion confirmation. If confirmed, deletes the car.
       * @returns {Promise<void>}
       * @public
       */
      async handleDeletePress() {
        const { ID: sCarId, Name: sName } = this.getView()
          .getModel()
          .getProperty("/Car");

        const sMessage = await this._generateItemDeletionQuestion(
          sCarId,
          sName
        );

        MessageBox.confirm(sMessage, {
          title: await this._getText("deletionMessageBoxTitle"),
          icon: MessageBox.Icon.WARNING,
          actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.DELETE,
          onClose: (sAction) => {
            if (sAction !== MessageBox.Action.DELETE) return;

            this._handleDeleteCar(sCarId);
          },
          dependentOn: this.getView(),
        });
      },

      /**
       * Generates a localized confirmation message for deletion.
       * @param {string} sId The ID of the car.
       * @param {string} sName The name of the car.
       * @returns {Promise<string>} Localized deletion message.
       * @private
       */
      _generateItemDeletionQuestion(sId, sName) {
        return this._getText("singleItemDeletionMessage", [sId, sName]);
      },

      /**
       * Removes the car from the model and shows a toast. Then navigates to car list.
       * @param {string} sCarId ID of the car to be deleted.
       * @private
       */
      _handleDeleteCar(sCarId) {
        const oParentModel = this.getOwnerComponent().getModel();
        const aFilteredCars = oParentModel
          .getProperty("/Cars")
          .filter((car) => car.ID !== sCarId);

        oParentModel.setProperty("/Cars", aFilteredCars);

        this._displayDeletionToast();

        setTimeout(() => {
          this.getOwnerComponent().getRouter().navTo(Constants.Routes.CAR_LIST);
        }, 750);
      },

      /**
       * Displays a localized toast message after deletion.
       * @returns {Promise<void>}
       * @private
       */
      async _displayDeletionToast() {
        MessageToast.show(await this._getText("singleItemDeletionToast"));
      },

      /**
       * Toggles the view's edit mode state.
       * @param {boolean} bEditMode True to enable edit mode.
       * @private
       */
      _toggleEditMode(bEditMode) {
        this.getView().getModel().setProperty("/EditMode", bEditMode);
      },

      /**
       * Navigates back to the car list view.
       * @public
       */
      onCarListPress() {
        this.getOwnerComponent().getRouter().navTo(Constants.Routes.CAR_LIST);
      },

      /**
       * Opens the sorting dialog for maintenance history.
       * @returns {Promise<void>}
       * @public
       */
      async handleSortButtonPressed() {
        this._oSortDialogFragment ??= await this.loadFragment({
          name: "nodar.miminoshvili.view.fragments.CarDetailsSortDialog",
        });

        this._oSortDialogFragment.open();
      },

      /**
       * Applies sorting to the maintenance history table based on dialog input.
       * @param {sap.ui.base.Event} oEvent Dialog confirmation event.
       * @public
       */

      handleSortDialogConfirm(oEvent) {
        const mParams = oEvent.getParameters();
        const sPath = mParams.sortItem.getKey();
        const bDescending = mParams.sortDescending;

        this.byId("maintenanceHistoryTable")
          .getBinding("items")
          .sort(new Sorter(sPath, bDescending));
      },
    });
  }
);
