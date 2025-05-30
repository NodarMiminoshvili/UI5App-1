sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
  ],

  (Controller, JSONModel, Filter, FilterOperator, Sorter) => {
    "use strict";

    return Controller.extend("nodar.miminoshvili.controller.StoresOverview", {
      /**
       * @description Initializes the controller, setting up filters, sorting, and categories.
       */
      onInit() {
        this.oActiveFilters = {};
        this.initSortState();
        this.initDeleteButtonState();

        const oModel = this.getOwnerComponent().getModel();
        const aItems = oModel.getProperty("/Cars");
        oModel.setProperty("/Count", aItems.length);
        this._insertCategories(oModel, aItems);
        this._insertSuppliers(oModel, aItems);
      },

      /**
       * @description Executes actions after the view has been rendered, binding the table items.
       */
      onAfterRendering() {
        this.oBinding = this.getView().byId("table").getBinding("items");
      },

      /**
       * @description Inserts unique car categories into the model, adding "Other" as an additional category.
       * @param {sap.ui.model.Model} oModel The model to update.
       * @param {Array} aItems List of car items.
       */
      _insertCategories(oModel, aItems) {
        const aCategories = aItems.reduce((prev, curr) => {
          if (prev.includes(curr.Category)) return prev;
          return [...prev, curr.Category];
        }, []);

        oModel.setProperty(
          "/CarCategories",
          [...aCategories, "Other"].map((sCategory) => {
            return { Category: sCategory };
          })
        );
      },

      /**
       * @description Inserts unique suppliers into the model.
       * @param {sap.ui.model.Model} oModel The model to update.
       * @param {Array} aItems List of car items.
       */
      _insertSuppliers(oModel, aItems) {
        const aSuppliers = aItems.reduce((prev, curr) => {
          if (prev.includes(curr.Supplier)) return prev;
          return [...prev, curr.Supplier];
        }, []);

        oModel.setProperty(
          "/Suppliers",
          aSuppliers.map((sSupplier) => {
            return { Supplier: sSupplier };
          })
        );
      },

      /**
       * @description Adds a new supplier to the model if it doesn't already exist.
       * @param {sap.ui.model.Model} oModel The model to update.
       * @param {Array} aItems List of car items.
       * @param {string} sSupplier Supplier name.
       */
      _addSupplier(oModel, aItems, sSupplier) {
        if (aItems.find((oItem) => oItem.Supplier === sSupplier)) return;

        const prevSuppliers = oModel.getProperty("/Suppliers");
        oModel.setProperty("/Suppliers", [
          ...prevSuppliers,
          { Supplier: sSupplier },
        ]);
      },

      /**
       * @description Handles the change event of the MultiComboBox to apply category filters.
       * @param {sap.ui.base.Event} oEvent The change event.
       */
      onMultiComboBoxChange(oEvent) {
        const aSelectedKeys = oEvent.getSource().getSelectedKeys();

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

          this.oActiveFilters.oCategoryFilter = oCombinedFilter;
        } else {
          delete this.oActiveFilters.oCategoryFilter;
        }

        this._applyFilters();
      },

      /**
       * @description Handles the change event of the ComboBox to apply supplier filters.
       * @param {sap.ui.base.Event} oEvent The change event.
       */
      onComboBoxChange(oEvent) {
        const sSelectedKey = oEvent.getSource().getSelectedKey();

        const oFilter = new Filter("Supplier", FilterOperator.EQ, sSelectedKey);

        if (sSelectedKey) {
          this.oActiveFilters.oSupplierFilter = oFilter;
        } else {
          delete this.oActiveFilters.oSupplierFilter;
        }
        this._applyFilters();
      },

      /**
       * @description Handles the search event to apply query filters.
       * @param {sap.ui.base.Event} oEvent The search event.
       */
      onSearch(oEvent) {
        const sQuery = oEvent.getParameter("query");

        const aFilters = ["ID", "Name", "Supplier"].map((property) => {
          return new Filter(property, FilterOperator.Contains, sQuery);
        });

        const oCombinedFilter = new Filter({
          filters: aFilters,
          and: false,
        });

        this.oActiveFilters.oQueryFilter = oCombinedFilter;

        this._applyFilters();
      },

      /**
       * @description Handles the date picker change event to apply release year filters.
       * @param {sap.ui.base.Event} oEvent The date picker change event.
       */
      onDatePickerChange(oEvent) {
        const selectedDate = oEvent.getSource().getDateValue();

        if (selectedDate) {
          var selectedYear = selectedDate.getFullYear();

          var oFilter = new Filter({
            path: "ReleaseYear",
            operator: FilterOperator.EQ,
            value1: selectedYear.toString(),
          });

          this.oActiveFilters.oReleaseYearFilter = oFilter;
        } else {
          delete this.oActiveFilters.oReleaseYearFilter;
        }
        this._applyFilters();
      },

      /**
       * @description Applies the active filters to the binding of the table.
       */
      _applyFilters() {
        const aFilters = Object.values(this.oActiveFilters);

        if (!aFilters.length) {
          this.oBinding.filter(null);
          this._trackItemCountChange();
          return;
        }

        this.oBinding.filter(aFilters, true);
        this._trackItemCountChange();
      },

      /**
       * @description Initializes the sorting state with an empty sorter.
       */
      initSortState() {
        const oSortModel = {
          sorter: { field: null },
        };

        const oModel = new JSONModel(oSortModel);
        this.getView().setModel(oModel, "sortModel");
      },

      /**
       * @description Handles the sorting event to toggle between ascending and descending sorting.
       * @param {sap.ui.base.Event} oEvent The sort event.
       */
      onSort(oEvent) {
        const sField = oEvent.getSource().data("field");
        const oSortModel = this.getView().getModel("sortModel");

        const aSortState = this.oBinding.aSorters;
        const oCurrentSortedField =
          aSortState && aSortState.find((sorter) => sorter.sPath === sField);

        if (!oCurrentSortedField) {
          const oSorter = new Sorter(sField, false);
          oSortModel.setProperty("/sorter", {
            sField,
            bDescending: false,
          });
          this.oBinding.sort(oSorter);

          return;
        }

        let oNextSorter;
        switch (oCurrentSortedField.bDescending) {
          case true:
            oNextSorter = null;
            oSortModel.setProperty("/sorter", {
              sField: null,
            });
            break;

          case false:
            oNextSorter = new Sorter(sField, true);
            oSortModel.setProperty("/sorter", {
              sField,
              bDescending: true,
            });
            break;

          default:
            oNextSorter = null;
            oSortModel.setProperty("/sorter", {
              sField: null,
            });
            break;
        }

        this.oBinding.sort(oNextSorter);
      },

      /**
       * @description Initializes the delete button state model with `enabled` set to false.
       */
      initDeleteButtonState() {
        const oModel = new JSONModel({
          enabled: false,
        });

        this.getView().setModel(oModel, "deleteButtonStateModel");
      },

      /**
       * @description Handles table selection changes to enable or disable the delete button.
       * @param {sap.ui.base.Event} oEvent The selection change event.
       */
      onTableSelectionChange(oEvent) {
        const aSelectedItems = oEvent.getSource().getSelectedItems();
        if (!aSelectedItems.length) {
          this.getView()
            .getModel("deleteButtonStateModel")
            .setProperty("/enabled", false);
          return;
        }

        this.getView()
          .getModel("deleteButtonStateModel")
          .setProperty("/enabled", true);
      },

      /**
       * @description Opens the item deletion confirmation dialog.
       * @param {sap.ui.base.Event} oEvent The open dialog event.
       */
      async onOpenItemDeleteDialog(oEvent) {
        this._oProductDelDialog ??= await this.loadFragment({
          name: "nodar.miminoshvili.view.fragments.ItemDeleteDialog",
        });
        this._oProductDelDialog.open();
        const oContext = oEvent.getSource().getBindingContext();
        this._oProductDelDialog.setBindingContext(oContext);
      },

      /**
       * @description Closes the item deletion confirmation dialog without making any changes.
       */
      onCancelItemDelete() {
        this._oProductDelDialog.close();
      },

      /**
       * @description Confirms the item deletion, updates the model, and removes selected items.
       */
      async onConfirmItemDelete() {
        const oTable = this.getView().byId("table");
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
          .getModel("deleteButtonStateModel")
          .setProperty("/enabled", false);

        oTable.removeSelections();
        this._oProductDelDialog.close();
        this._trackItemCountChange();
      },

      /**
       * @description Opens the product form dialog to create a new item.
       */
      async onOpenProductForm() {
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

      /**
       * @description Closes the product form dialog without saving the item.
       */
      onCancelItemCreation() {
        this._oProductFormDialog.close();
      },

      /**
       * @description Saves the newly created item to the model and updates the suppliers.
       */
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

        this._addSupplier(oModel, aPrevItems, oNewItemModel.Supplier);

        this._oProductFormDialog.close();

        this._trackItemCountChange();
      },

      /**
       * Validates input and textarea fields using their data types.
       * @param {sap.ui.core.Element} oContainer UI container with child fields.
       * @returns {boolean|void} True if all fields are valid, false or void otherwise.
       * @protected
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
            oControl.setValueState("None");
          } catch (e) {
            oControl.setValueState("Error");
            oControl.setValueStateText(e.message);
            isValid = false;
          }
        });

        return isValid;
      },

      /**
       * @description Generates a unique item ID based on the current number of items in the model.
       * @param {Array} aPrevItems The previous list of items.
       * @returns {string} A new unique item ID.
       * @protected
       */
      _generateItemId(aPrevItems) {
        return `C${Math.round(Math.random() * 10)}0${aPrevItems.length + 1}`;
      },

      /**
       * @description Tracks the change in the item count and updates the model.
       */
      _trackItemCountChange() {
        const iCount = this.oBinding.getCount();
        const oModel = this.oBinding.getModel();
        oModel.setProperty("/Count", iCount);
      },
    });
  }
);
