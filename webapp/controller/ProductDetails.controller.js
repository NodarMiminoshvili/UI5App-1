sap.ui.define(
  [
    "nodar/miminoshvili/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "nodar/miminoshvili/utils/constants",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],

  (BaseController, JSONModel, Constants, MessageBox, MessageToast) => {
    "use strict";

    return BaseController.extend(
      "nodar.miminoshvili.controller.ProductDetails",
      {
        /**
         * Initializes the controller and sets up the route pattern handler.
         * @public
         */
        onInit() {
          this.getOwnerComponent()
            .getRouter()
            .getRoute(Constants.Routes.PRODUCT_DETAILS)
            .attachPatternMatched(this.onPatternMatched.bind(this));
        },

        /**
         * Triggered when the route pattern is matched. Loads product details into the view model.
         * @param {sap.ui.base.Event} oEvent Route event containing the productId parameter.
         * @public
         */
        onPatternMatched(oEvent) {
          const { productId: sProductId } = oEvent.getParameter("arguments");
          this.getView().bindObject({
            path: `/Products(${sProductId})`,
            parameters: { expand: "Supplier,Category" },
          });
          this.getView().setModel(
            new JSONModel({ EditMode: false }),
            "appState"
          );
        },

        /**
         * Enables edit mode.
         * @public
         */
        handleEditPress() {
          this._toggleEditMode(true);
        },

        /**
         * Cancels editing by disabling edit mode and resets model changes.
         * @public
         */
        handleCancelPress() {
          this._toggleEditMode(false);
          this.getView().getModel().resetChanges();
        },

        /**
         * Validates the form and updates edited product data if valid.
         * @public
         */
        handleSavePress() {
          const oModel = this.getView().getModel();

          if (!this._validateFormFields(this.byId("form"))) {
            return;
          }

          if (!oModel.hasPendingChanges()) {
            this._toggleEditMode(false);
            return;
          }

          const sSelectedSupplierKey =
            this.byId("supplierSelect").getSelectedKey();
          const sSelectedCategoryKey =
            this.byId("categorySelect").getSelectedKey();

          const oODataAssociations = {
            Category: {
              __metadata: {
                uri: oModel.createKey("/Categories", {
                  ID: sSelectedCategoryKey,
                }),
              },
            },

            Supplier: {
              __metadata: {
                uri: oModel.createKey("/Suppliers", {
                  ID: sSelectedSupplierKey,
                }),
              },
            },
          };

          const oEditedItem = {
            ...this.getView().getBindingContext().getObject({
              select: "Name,Description,ReleaseDate,Rating,Price",
            }),

            ...oODataAssociations,
          };

          delete oEditedItem.__metadata;

          if (typeof oEditedItem.Price === "number") {
            oEditedItem.Price = oEditedItem.Price.toString();
          }

          oModel.update(
            this.getView().getBindingContext().getPath(),
            oEditedItem,
            {
              success: () => {
                this._toggleEditMode(false);
              },
              error: (oError) => {
                console.error(oError);
              },
            }
          );
        },

        /**
         * Prompts deletion confirmation. If confirmed, deletes the product.
         * @returns {Promise<void>}
         * @public
         */
        async handleDeletePress() {
          const { ID: sProductId, Name: sName } = this.getView()
            .getBindingContext()
            .getObject();

          const sMessage = await this._generateItemDeletionQuestion(
            sProductId,
            sName
          );

          MessageBox.confirm(sMessage, {
            title: await this._getText("deletionMessageBoxTitle"),
            icon: MessageBox.Icon.WARNING,
            actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.DELETE,
            onClose: (sAction) => {
              if (sAction !== MessageBox.Action.DELETE) return;

              this._handleDeleteItem();
            },
            dependentOn: this.getView(),
          });
        },

        /**
         * Generates a localized confirmation message for deletion.
         * @param {string} sId The ID of the product.
         * @param {string} sName The name of the product.
         * @returns {Promise<string>} Localized deletion message.
         * @private
         */
        _generateItemDeletionQuestion(sId, sName) {
          return this._getText("singleItemDeletionMessage", [sId, sName]);
        },

        /**
         * Removes the product from the model and shows a toast. Then navigates to product list.
         * @private
         */
        _handleDeleteItem() {
          const oView = this.getView();

          oView.getModel().remove(oView.getBindingContext().getPath(), {
            success: async () => {
              await this._displayDeletionToast();
              setTimeout(() => {
                this.getOwnerComponent()
                  .getRouter()
                  .navTo(Constants.Routes.PRODUCT_LIST);
              }, 750);
            },
            error: (oError) => {
              console.error(oError);
              this._displayToast("deleteFailed");
            },
            refreshAfterChange: true,
          });
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
          this.getView()
            .getModel("appState")
            .setProperty("/EditMode", bEditMode);
        },

        /**
         * Navigates back to the product list view.
         * @public
         */
        onProductListPress() {
          this.getOwnerComponent()
            .getRouter()
            .navTo(Constants.Routes.PRODUCT_LIST);
          this.getView().getModel().resetChanges();
        },
      }
    );
  }
);
