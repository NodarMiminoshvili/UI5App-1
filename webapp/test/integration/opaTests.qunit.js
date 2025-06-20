sap.ui.define(
  [
    "sap/ui/test/Opa5",
    "sap/ui/test/opaQunit",
    "sap/ui/test/actions/Press",
    "sap/ui/test/actions/EnterText",
    "sap/ui/test/matchers/PropertyStrictEquals",
  ],
  function (Opa5, opaTest, Press, EnterText, PropertyStrictEquals) {
    "use strict";

    QUnit.module("Creation test");

    Opa5.extendConfig({
      viewNamespace: "nodar.miminoshvili.view.",
      autoWait: true,
    });

    /**
     * Tests the creation and deletion of a car item in the CarList view.
     * @param {Object} Given - OPA5 given context
     * @param {Object} When - OPA5 when context
     * @param {Object} Then - OPA5 then context
     */
    opaTest("Should find a Button with an id", function (Given, When, Then) {
      Given.iStartMyAppInAFrame("http://localhost:8080/index.html");

      When.waitFor({
        viewName: "CarList",
        id: "createButton",
        actions: new Press(),
        errorMessage: "Did not find the create button",
      });

      Then.waitFor({
        viewName: "CarList",
        fragmentId: "itemFormDialog",
        errorMessage: "Item creation fragment is missing ",
      });

      Then.waitFor({
        viewName: "CarList",
        id: "nameInput",
        actions: new EnterText({ text: "Subaru BRZ" }),
        errorMessage: "Name input is missing",
      });

      Then.waitFor({
        viewName: "CarList",
        id: "supplierInput",
        actions: new EnterText({ text: "Subaru" }),
        errorMessage: "Supplier input is missing",
      });

      Then.waitFor({
        viewName: "CarList",
        id: "priceInputControl--innerInput",
        actions: new EnterText({ text: "2900" }),
        errorMessage: "Price input is missing",
      });

      Then.waitFor({
        viewName: "CarList",
        id: "saveNewItemButton",
        actions: new Press(),
        errorMessage: "Save button is missing",
      });

      Then.waitFor({
        viewName: "CarList",
        id: "searchField",
        actions: new EnterText({
          text: "Subaru BRZ",
          pressEnterKey: true,
        }),
        errorMessage: "Couldn't find the product",
      });

      Then.waitFor({
        viewName: "CarList",
        id: "table",

        success: function () {
          Then.waitFor({
            controlType: "sap.m.CheckBox",
            success: function (aSelectionControls) {
              new Press().executeOn(aSelectionControls[0]);
              Opa5.assert.ok(
                true,
                "Successfully selected the single item via its selection control."
              );
            },
            errorMessage: "Did not find selection control for the single item.",
          });
        },
        errorMessage: "Could not find the products table.",
      });

      Then.waitFor({
        viewName: "CarList",
        id: "deleteButton",
        actions: new Press(),
        errorMessage: "Save button is missing",
      });

      Then.waitFor({
        controlType: "sap.m.Button",
        searchOpenDialogs: true,
        matchers: new PropertyStrictEquals({
          name: "text",
          value: "Delete",
        }),
        actions: new Press(),
        errorMessage: "Did not find the 'Delete' button in the MessageBox",
      });

      Then.waitFor({
        viewName: "CarList",
        id: "searchField",
        actions: new EnterText({
          text: "",
          pressEnterKey: true,
        }),
        errorMessage: "Couldn't search for products",
      });

      Then.iTeardownMyAppFrame();
    });
  }
);
