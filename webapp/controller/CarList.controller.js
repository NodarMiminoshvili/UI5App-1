sap.ui.define(
  [
    "nodar/miminoshvili/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "nodar/miminoshvili/utils/constants",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/library",
  ],

  (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    Sorter,
    Constants,
    MessageBox,
    MessageToast,
    CoreLibrary
  ) => {
    "use strict";

    return BaseController.extend("nodar.miminoshvili.controller.CarList", {
      onInit() {
        this._initAppState();
        this.oActiveFilters = {};

        const oModel = this.getOwnerComponent().getModel();
        const aItems = oModel.getProperty("/Cars");
        oModel.setProperty("/Count", aItems.length);
      },

      onMultiComboBoxChange(oEvent) {
        const aSelectedKeys = oEvent.getSource().getSelectedKeys();
        const oModel = this.getView().getModel("appState");

        if (aSelectedKeys.length > 0) {
          const aFilters = aSelectedKeys.map((_, idx) => {
            return new Filter(
              "Category",
              FilterOperator.EQ,
              aSelectedKeys[idx]
            );
          });

          const oCombinedFilter = new Filter({
            filters: aFilters,
            and: false,
          });

          oModel.setProperty("/ActiveFilters/CategoryFilter", oCombinedFilter);
        } else {
          const oData = oModel.getData();
          delete oData.ActiveFilters.CategoryFilter;
          oModel.setData(oData);
        }

        this._applyFilters();
      },

      onComboBoxChange(oEvent) {
        const sSelectedKey = oEvent.getSource().getSelectedKey();
        const oModel = this.getView().getModel("appState");

        const oFilter = new Filter("Supplier", FilterOperator.EQ, sSelectedKey);

        if (sSelectedKey) {
          oModel.setProperty("/ActiveFilters/SupplierFilter", oFilter);
        } else {
          const oData = oModel.getData();
          delete oData.ActiveFilters.SupplierFilter;
          oModel.setData(oData);
        }
        this._applyFilters();
      },

      onSearch(oEvent) {
        const sQuery = oEvent.getParameter("query");
        const oModel = this.getView().getModel("appState");

        const aFilters = ["ID", "Name", "Supplier"].map((property) => {
          return new Filter(property, FilterOperator.Contains, sQuery);
        });

        const oCombinedFilter = new Filter({
          filters: aFilters,
          and: false,
        });

        oModel.setProperty("/ActiveFilters/QueryFilter", oCombinedFilter);

        this._applyFilters();
      },

      onDatePickerChange(oEvent) {
        const selectedDate = oEvent.getSource().getDateValue();
        const oModel = this.getView().getModel("appState");

        if (selectedDate) {
          const selectedYear = selectedDate.getFullYear();

          const oFilter = new Filter({
            path: "ReleaseYear",
            operator: FilterOperator.EQ,
            value1: selectedYear.toString(),
          });

          oModel.setProperty("/ActiveFilters/ReleaseYearFilter", oFilter);
        } else {
          const oData = oModel.getData();
          delete oData.ActiveFilters.ReleaseYearFilter;
          oModel.setData(oData);
        }
        this._applyFilters();
      },

      _applyFilters() {
        const oModel = this.getView().getModel("appState");
        const aFilters = Object.values(oModel.getProperty("/ActiveFilters"));
        const oBinding = this.byId("table").getBinding("items");

        if (!aFilters.length) {
          oBinding.filter(null);
          this._trackItemCountChange();
          return;
        }

        oBinding.filter(aFilters, true);
        this._trackItemCountChange();
      },

      _initAppState() {
        const oModel = new JSONModel({
          DeleteButton: { Enabled: false },
          ActiveFilters: {},
        });

        this.getView().setModel(oModel, "appState");
      },

      onTableSelectionChange(oEvent) {
        const aSelectedItems = oEvent.getSource().getSelectedItems();

        this.getView()
          .getModel("appState")
          .setProperty("/DeleteButton/Enabled", !!aSelectedItems.length);
      },

      async handleDeletePress() {
        const sMessage = await this._generateItemDeletionQuestion();

        MessageBox.confirm(sMessage, {
          title: await this._getText("deletionMessageBoxTitle"),
          icon: MessageBox.Icon.WARNING,
          actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.DELETE,
          onClose: (sAction) => {
            if (sAction !== MessageBox.Action.DELETE) return;

            this._onConfirmItemDelete();
          },
          dependentOn: this.getView(),
        });
      },

      _onConfirmItemDelete() {
        const oTable = this.byId("table");
        const aSelectedItems = oTable.getSelectedItems();

        const oModel = this.getView().getModel();
        const aFilteredItems = [...oModel.getProperty("/Cars")];

        aSelectedItems.forEach((oSelectedItem) => {
          const sSelectedItemId = oSelectedItem
            .getBindingContext()
            .getObject().ID;

          const iItemIdx = aFilteredItems.findIndex(
            (oItem) => oItem.ID === sSelectedItemId
          );

          if (iItemIdx === -1) return;

          aFilteredItems.splice(iItemIdx, 1);
        });

        oModel.setProperty("/Cars", aFilteredItems);

        this.getView()
          .getModel("appState")
          .setProperty("/DeleteButton/Enabled", false);

        oTable.removeSelections();
        this._trackItemCountChange();
        this._displayDeletionToast(aSelectedItems.length);
      },

      async _displayDeletionToast(iDeletedItemsCount) {
        MessageToast.show(
          iDeletedItemsCount > 1
            ? await this._getText("multipleItemDeletionToast", [
                iDeletedItemsCount,
              ])
            : await this._getText("singleItemDeletionToast")
        );
      },

      _generateItemDeletionQuestion() {
        const oTable = this.byId("table");
        const iSelectedItemsLength = oTable.getSelectedItems().length;

        if (iSelectedItemsLength > 1) {
          return this._getText("multipleItemDeletionMessage", [
            iSelectedItemsLength,
          ]);
        }

        const { ID: sId, Name: sName } = oTable
          .getSelectedItem()
          .getBindingContext()
          .getObject();

        return this._getText("singleItemDeletionMessage", [sId, sName]);
      },

      async onOpenProductForm() {
        this._oProductFormDialog &&
          this._resetFormFieldErrorStates(this.byId("itemFormDialog"));

        this._oProductFormDialog ??= await this.loadFragment({
          name: "nodar.miminoshvili.view.fragments.ItemFormDialog",
        });

        const oDate = new Date();

        this.byId("itemFormDatePicker").setMaxDate(oDate);

        const oModel = new JSONModel({
          ReleaseYear: oDate,
          PriceCurrency: "USD",
          Category: "Sedan",
          Status: "In Stock",
          Photo: "/images/car.svg",
        });

        this._oProductFormDialog.setModel(oModel, "newItemModel");

        this._oProductFormDialog.open();
      },

      onCancelItemCreation() {
        this._oProductFormDialog.close();
      },

      onSaveItem() {
        const oModel = this.getView().getModel();

        const oNewItemModel = this._oProductFormDialog
          .getModel("newItemModel")
          .getData();

        if (!this._validateFormFields(this.byId("itemFormDialog"))) {
          return;
        }

        const aPrevItems = oModel.getProperty("/Cars");
        oModel.setProperty("/Cars", [
          ...aPrevItems,
          {
            ...oNewItemModel,
            ID: this._generateItemId(aPrevItems),
            ReleaseYear: oNewItemModel.ReleaseYear.getFullYear(),
          },
        ]);

        this._oProductFormDialog.close();

        this._trackItemCountChange();
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
            oControl.setValueState(CoreLibrary.ValueState.None);
          } catch (e) {
            oControl.setValueState(CoreLibrary.ValueState.Error);
            oControl.setValueStateText(e.message);
            isValid = false;
          }
        });

        return isValid;
      },

      _generateItemId(aPrevItems) {
        return `C${Math.round(Math.random() * 10)}0${aPrevItems.length + 1}`;
      },

      _trackItemCountChange() {
        const oBinding = this.byId("table").getBinding("items");
        const iCount = oBinding.getCount();
        const oModel = oBinding.getModel();
        oModel.setProperty("/Count", iCount);
      },

      onColPress(oEvent) {
        const { ID: carId } = oEvent
          .getSource()
          .getBindingContext()
          .getObject();

        this.getOwnerComponent()
          .getRouter()
          .navTo(Constants.Routes.CAR_DETAILS, { carId });
      },

      async handleSortButtonPressed() {
        this._oSortDialogFragment ??= await this.loadFragment({
          name: "nodar.miminoshvili.view.fragments.CarListSortDialog",
        });

        this._oSortDialogFragment.open();
      },

      handleSortDialogConfirm(oEvent) {
        const mParams = oEvent.getParameters();
        const sPath = mParams.sortItem.getKey();
        const bDescending = mParams.sortDescending;

        this.byId("table")
          .getBinding("items")
          .sort(new Sorter(sPath, bDescending));
      },
    });
  }
);
