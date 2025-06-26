sap.ui.define(
  [
    "sap/ui/core/Control",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/HBox",
  ],
  function (Control, Label, Input, Select, Item, HBox) {
    "use strict";

    return Control.extend("nodar.miminoshvili.PriceInputControl", {
      metadata: {
        properties: {
          label: {
            type: "string",
            defaultValue: "",
            bindable: "bindable",
          },

          placeholder: {
            type: "string",
            defaultValue: "",
            bindable: "bindable",
          },
        },
        aggregations: {
          _label: {
            type: "sap.m.Label",
            multiple: false,
            visibility: "hidden",
          },
          _input: {
            type: "sap.m.Input",
            multiple: false,
            visibility: "hidden",
          },
          _select: {
            type: "sap.m.Select",
            multiple: false,
            visibility: "hidden",
          },
          _hbox: { type: "sap.m.HBox", multiple: false, visibility: "hidden" },
        },
      },

      init() {
        this.setAggregation(
          "_label",
          new Label({
            text: this.getLabel(),
            showColon: true,
            required: true,
          })
        );

        const oInput = new Input({
          id: this.getId() + "--innerInput",
          type: "Number",
          placeholder: this.getPlaceholder(),
          required: true,
          valueLiveUpdate: true,

          value: {
            path: "appState>/newItem/PriceAmount",
            type: "sap.ui.model.type.Integer",
            constraints: { minimum: 1000, maximum: 10000000 },
          },
        });

        const oSelect = new Select({
          selectedKey: "{appState>/newItem/PriceCurrency}",
          items: [
            new Item({ key: "USD", text: "USD" }),
            new Item({ key: "EUR", text: "EUR" }),
          ],
        });

        this.setAggregation("_input", oInput);
        this.setAggregation("_select", oSelect);
        this.setAggregation(
          "_hbox",
          new HBox({
            items: [oInput, oSelect],
          })
        );
      },

      setLabel(sLabel) {
        this.setProperty("placeholder", sLabel);
        this.getAggregation("_label").setText(sLabel);
      },

      setPlaceholder(sPlaceholder) {
        this.setProperty("placeholder", sPlaceholder);
        this.getAggregation("_hbox").getItems()[0].setPlaceholder(sPlaceholder);
      },

      renderer: function (oRm, oControl) {
        oRm.openStart("div", oControl);
        oRm.openEnd();

        oRm.renderControl(oControl.getAggregation("_label"));
        oRm.renderControl(oControl.getAggregation("_hbox"));

        oRm.close("div");
      },
    });
  }
);
