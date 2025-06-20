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
  ],

  (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    Sorter,
    Constants,
    MessageBox,
    MessageToast
  ) => {
    "use strict";

    return BaseController.extend("nodar.miminoshvili.controller.CarList", {
      /**
       * Initializes the controller and sets the item count in the model.
       * @public
       */
      onInit() {
        const oModel = this.getOwnerComponent().getModel();
        const aItems = oModel.getProperty("/Cars");
        oModel.setProperty("/Count", aItems.length);
      },

      /**
       * Initializes the app state model before rendering.
       * @public
       */
      onBeforeRendering() {
        this._initAppState();
      },

      /**
       * Handles MultiComboBox selection changes and applies category filters.
       * @public
       * @param {sap.ui.base.Event} oEvent - The MultiComboBox change event
       */
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

      /**
       * Handles ComboBox selection changes and applies supplier filters.
       * @public
       * @param {sap.ui.base.Event} oEvent - The ComboBox change event
       */
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

      /**
       * Handles search input and applies filters based on query.
       * @public
       * @param {sap.ui.base.Event} oEvent - The search event
       */
      onSearch(oEvent) {
        const sQuery = oEvent.getParameter("query");
        const oModel = this.getView().getModel("appState");

        if (!sQuery) {
          const aActiveFilters = { ...oModel.getProperty("/ActiveFilters") };

          if (!aActiveFilters.QueryFilter) return;

          delete aActiveFilters.QueryFilter;
          oModel.setProperty("/ActiveFilters", aActiveFilters);
          this._applyFilters();
          return;
        }

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

      /**
       * Handles DatePicker changes and applies release year filters.
       * @public
       * @param {sap.ui.base.Event} oEvent - The DatePicker change event
       */
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

      /**
       * Applies active filters to the table binding and updates labels.
       * @private
       */
      _applyFilters() {
        const oModel = this.getView().getModel("appState");
        const aFilters = Object.values(oModel.getProperty("/ActiveFilters"));
        const oBinding = this.byId("table").getBinding("items");
        this._generateActiveFiltersLabel();

        if (!aFilters.length) {
          oBinding.filter(null);
          this._trackItemCountChange();
          return;
        }

        oBinding.filter(aFilters, true);
        this._trackItemCountChange();
      },

      /**
       * Generates and sets labels for active filters.
       * @private
       * @returns {Promise<void>}
       */
      async _generateActiveFiltersLabel() {
        const oModel = this.getView().getModel("appState");
        const oFilters = oModel.getProperty("/ActiveFilters");

        const iActiveFilterCount = Object.keys(oFilters).length;
        let sSnappedLabel, sExpandedLabel;

        if (!iActiveFilterCount) {
          sSnappedLabel = sExpandedLabel = await this._getText(
            "noActiveFiltersLabel"
          );
        } else {
          sExpandedLabel = await this._getText("expandedFilterLabel", [
            iActiveFilterCount,
          ]);

          const aFilters = Object.keys(oFilters).map((sFilterType) => {
            return this._getText(sFilterType);
          });

          await Promise.all(aFilters).then(async (aFilterNames) => {
            sSnappedLabel = await this._getText("snappedFilterLabel", [
              iActiveFilterCount,
              aFilterNames.join(", "),
            ]);
          });
        }

        oModel.setProperty("/SnappedLabel", sSnappedLabel);
        oModel.setProperty("/ExpandedLabel", sExpandedLabel);
      },

      /**
       * Initializes the app state model with default values.
       * @private
       */
      _initAppState() {
        const sNoActiveFiltersLabel = this._getText("noActiveFiltersLabel");

        const oModel = new JSONModel({
          DeleteButton: { Enabled: false },
          ActiveFilters: {},
          ExpandedLabel: sNoActiveFiltersLabel,
          SnappedLabel: sNoActiveFiltersLabel,
        });

        this.getView().setModel(oModel, "appState");
      },

      /**
       * Updates delete button state based on table selection.
       * @public
       * @param {sap.ui.base.Event} oEvent - The table selection change event
       */
      onTableSelectionChange(oEvent) {
        const aSelectedItems = oEvent.getSource().getSelectedItems();

        this.getView()
          .getModel("appState")
          .setProperty("/DeleteButton/Enabled", !!aSelectedItems.length);
      },

      /**
       * Displays a confirmation dialog for item deletion.
       * @public
       * @returns {Promise<void>}
       */
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

      /**
       * Deletes selected items from the model and updates UI.
       * @private
       */
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

      /**
       * Displays a toast message after item deletion.
       * @private
       * @param {number} iDeletedItemsCount - Number of deleted items
       * @returns {Promise<void>}
       */
      async _displayDeletionToast(iDeletedItemsCount) {
        MessageToast.show(
          iDeletedItemsCount > 1
            ? await this._getText("multipleItemDeletionToast", [
                iDeletedItemsCount,
              ])
            : await this._getText("singleItemDeletionToast")
        );
      },

      /**
       * Generates a deletion confirmation message based on selected items.
       * @private
       * @returns {Promise<string>} The deletion message
       */
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

      /**
       * Opens the product form dialog for creating a new item.
       * @public
       * @returns {Promise<void>}
       */
      async onOpenProductForm() {
        this._oProductFormDialog &&
          this._resetFormFieldErrorStates(this.byId("itemFormDialog"));

        this._oProductFormDialog ??= await this.loadFragment({
          name: "nodar.miminoshvili.view.fragments.ItemFormDialog",
        });

        const oDate = new Date();

        this.byId("itemFormDatePicker").setMaxDate(oDate);

        this.getView().getModel("appState").setProperty("/newItem", {
          ReleaseYear: oDate,
          PriceCurrency: "USD",
          Category: "Sedan",
          Status: "In Stock",
          Photo: "/images/car.svg",
        });

        this._oProductFormDialog.open();
      },

      /**
       * Closes the product form dialog without saving.
       * @public
       */
      onCancelItemCreation() {
        this._oProductFormDialog.close();
      },

      /**
       * Saves a new item to the model after validation.
       * @public
       */
      onSaveItem() {
        const oModel = this.getView().getModel();

        const oNewItem = this.getView()
          .getModel("appState")
          .getProperty("/newItem");

        if (!this._validateFormFields(this.byId("itemFormDialog"))) {
          return;
        }

        const aPrevItems = oModel.getProperty("/Cars");
        oModel.setProperty("/Cars", [
          ...aPrevItems,
          {
            ...oNewItem,
            ID: this._generateItemId(aPrevItems),
            ReleaseYear: oNewItem.ReleaseYear.getFullYear(),
          },
        ]);

        this._oProductFormDialog.close();

        this._trackItemCountChange();
      },

      /**
       * Generates a unique ID for a new item.
       * @private
       * @param {Array} aPrevItems - Array of existing items
       * @returns {string} The generated item ID
       */
      _generateItemId(aPrevItems) {
        return `C${Math.round(Math.random() * 10)}0${aPrevItems.length + 1}`;
      },

      /**
       * Updates the item count in the model after changes.
       * @private
       */
      _trackItemCountChange() {
        const oBinding = this.byId("table").getBinding("items");
        const iCount = oBinding.getCount();
        const oModel = oBinding.getModel();
        oModel.setProperty("/Count", iCount);
      },

      /**
       * Navigates to the car details page.
       * @public
       * @param {sap.ui.base.Event} oEvent - The column press event
       */
      onColPress(oEvent) {
        const { ID: carId } = oEvent
          .getSource()
          .getBindingContext()
          .getObject();

        this.getOwnerComponent()
          .getRouter()
          .navTo(Constants.Routes.CAR_DETAILS, { carId });
      },

      /**
       * Opens the sort dialog for the car list.
       * @public
       * @returns {Promise<void>}
       */
      async handleSortButtonPressed() {
        this._oSortDialogFragment ??= await this.loadFragment({
          name: "nodar.miminoshvili.view.fragments.CarListSortDialog",
        });

        this._oSortDialogFragment.open();
      },

      /**
       * Applies sorting to the table based on dialog settings.
       * @public
       * @param {sap.ui.base.Event} oEvent - The sort dialog confirm event
       */
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
