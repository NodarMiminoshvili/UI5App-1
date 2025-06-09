sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "nodar/miminoshvili/utils/Constants",
    "nodar/miminoshvili/model/formatter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],

  (Controller, JSONModel, Constants, formatter, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("nodar.miminoshvili.controller.StoresOverview", {
      formatter,
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
        } = this.getOwnerComponent().getModel().getData();

        const oSelectedCar = aCars.find((car) => car.ID === sCarId);
        const aSelectedCarMaintenanceHistory = aMaintenanceHistorySet.filter(
          (set) => set.CarID === sCarId
        );

        const oCarModel = {
          Car: oSelectedCar,
          MaintenanceHistory: aSelectedCarMaintenanceHistory,
          Categories,
        };

        const oModel = new JSONModel(oCarModel);
        this.getView().setModel(oModel);

        if (this._oChangeForm) {
          this._toggleEditMode(false);
        } else {
          this._insertDisplayForm();
        }
      },

      async _insertDisplayForm() {
        this._oDisplayForm ??= await this.loadFragment({
          name: "nodar.miminoshvili.view.fragments.DisplayItemInfo",
        });

        this.byId("ObjectPageLayout").insertSection(this._oDisplayForm);
      },

      async _insertChangeForm() {
        this._oChangeForm ??= await this.loadFragment({
          name: "nodar.miminoshvili.view.fragments.ChangeItemInfo",
        });

        this.byId("ObjectPageLayout").insertSection(this._oChangeForm);
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
        this._toggleEditMode(false);

        const oEditedCar = this.getView().getModel().getProperty("/EditedCar");
        this.getView().getModel().setProperty("/Car", oEditedCar);

        const aUpdatedCars = this.getOwnerComponent()
          .getModel()
          .getProperty("/Cars")
          .map((car) => (car.ID === oEditedCar.ID ? oEditedCar : car));

        this.getOwnerComponent().getModel().setProperty("/Cars", aUpdatedCars);
      },

      handleDeletePress() {
        MessageBox.confirm("Delete this Car?", {
          actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.DELETE,
          onClose: (sAction) => {
            sAction === "DELETE"
              ? this._handleDeleteCar()
              : MessageToast.show("Deletion Canceled");
          },
          dependentOn: this.getView(),
        });
      },

      _handleDeleteCar() {
        const { ID: sCarId } = this.getView().getModel().getProperty("/Car");

        const oParentModel = this.getOwnerComponent().getModel();
        const aFilteredCars = oParentModel
          .getProperty("/Cars")
          .filter((car) => car.ID !== sCarId);

        oParentModel.setProperty("/Cars", aFilteredCars);

        MessageToast.show("Car Deleted Succesfully");
        setTimeout(() => {
          this.getOwnerComponent().getRouter().navTo(Constants.Routes.CAR_LIST);
        }, 1000);
      },

      _toggleEditMode(bEditMode) {
        this._toggleEditModeButtons(bEditMode);
        this._toggleEditModeFragments(bEditMode);
      },

      _toggleEditModeButtons(bEditMode) {
        this.byId("editButton").setVisible(!bEditMode);
        this.byId("deleteButton").setVisible(!bEditMode);
        this.byId("saveButton").setVisible(bEditMode);
        this.byId("cancelButton").setVisible(bEditMode);
      },

      _toggleEditModeFragments(bEditMode) {
        this.byId("ObjectPageLayout").removeSection(
          bEditMode ? this._oDisplayForm : this._oChangeForm
        );

        bEditMode ? this._insertChangeForm() : this._insertDisplayForm();
      },

      onCarListPress() {
        this.getOwnerComponent().getRouter().navTo(Constants.Routes.CAR_LIST);
      },
    });
  }
);
