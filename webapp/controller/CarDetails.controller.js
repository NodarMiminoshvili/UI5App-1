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

    return BaseController.extend(
      "nodar.miminoshvili.controller.StoresOverview",
      {
        onInit() {
          this.getOwnerComponent()
            .getRouter()
            .getRoute(Constants.Routes.CAR_DETAILS)
            .attachPatternMatched(this.onPatternMatched.bind(this));
        },

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

        handleEditPress() {
          this._toggleEditMode(true);
          const oModel = this.getView().getModel();
          const oCarBeforeEdit = oModel.getProperty("/Car");
          oModel.setProperty("/EditedCar", { ...oCarBeforeEdit });
        },

        handleCancelPress() {
          this._toggleEditMode(false);
        },

        handleSavePress() {
          const bIsValid = this._validateFormFields(this.byId("form"));
          if (!bIsValid) return;

          this._toggleEditMode(false);

          const oEditedCar = this.getView()
            .getModel()
            .getProperty("/EditedCar");
          this.getView().getModel().setProperty("/Car", oEditedCar);

          const aUpdatedCars = this.getOwnerComponent()
            .getModel()
            .getProperty("/Cars")
            .map((car) => (car.ID === oEditedCar.ID ? oEditedCar : car));

          this.getOwnerComponent()
            .getModel()
            .setProperty("/Cars", aUpdatedCars);
        },

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

        _generateItemDeletionQuestion(sId, sName) {
          return this._getText("singleItemDeletionMessage", [sId, sName]);
        },

        _handleDeleteCar(sCarId) {
          const oParentModel = this.getOwnerComponent().getModel();
          const aFilteredCars = oParentModel
            .getProperty("/Cars")
            .filter((car) => car.ID !== sCarId);

          oParentModel.setProperty("/Cars", aFilteredCars);

          this._displayDeletionToast();

          setTimeout(() => {
            this.getOwnerComponent()
              .getRouter()
              .navTo(Constants.Routes.CAR_LIST);
          }, 750);
        },

        async _displayDeletionToast(iDeletedItemsCount) {
          MessageToast.show(await this._getText("singleItemDeletionToast"));
        },

        _toggleEditMode(bEditMode) {
          this.getView().getModel().setProperty("/EditMode", bEditMode);
        },

        onCarListPress() {
          this.getOwnerComponent().getRouter().navTo(Constants.Routes.CAR_LIST);
        },

        async handleSortButtonPressed() {
          this._oSortDialogFragment ??= await this.loadFragment({
            name: "nodar.miminoshvili.view.fragments.CarDetailsSortDialog",
          });

          this._oSortDialogFragment.open();
        },

        handleSortDialogConfirm(oEvent) {
          const mParams = oEvent.getParameters();
          const sPath = mParams.sortItem.getKey();
          const bDescending = mParams.sortDescending;

          this.byId("maintenanceHistoryTable")
            .getBinding("items")
            .sort(new Sorter(sPath, bDescending));
        },
      }
    );
  }
);
