sap.ui.define(
  [
    "nodar/miminoshvili/model/formatter",
    "nodar/miminoshvili/utils/constants",
    "sap/ui/core/library",
  ],
  function (formatter, Constants, CoreLibrary) {
    "use strict";

    QUnit.module("Status State");

    /**
     * Executes a single status-to-state test case.
     *
     * @param {object} oOptions - Test options
     * @param {QUnit.Assert} oOptions.assert - QUnit assertion object
     * @param {string} oOptions.status - Product status to format
     * @param {string} oOptions.expected - Expected ValueState
     */
    function statusToStateCase(oOptions) {
      const sState = formatter.statusToState(oOptions.status);

      oOptions.assert.strictEqual(sState, oOptions.expected);
    }

    QUnit.test(
      `Should format the products with a status "${Constants.ItemStatus.IN_STOCK}" to "${CoreLibrary.ValueState.Success}"`,
      function (assert) {
        statusToStateCase.call(this, {
          assert: assert,
          status: Constants.ItemStatus.IN_STOCK,
          expected: CoreLibrary.ValueState.Success,
        });
      }
    );

    QUnit.test(
      `Should format the products with a status "${Constants.ItemStatus.OUT_OF_STOCK}" to "${CoreLibrary.ValueState.Warning}"`,
      function (assert) {
        statusToStateCase.call(this, {
          assert: assert,
          status: Constants.ItemStatus.OUT_OF_STOCK,
          expected: CoreLibrary.ValueState.Warning,
        });
      }
    );

    QUnit.test(
      `Products with an invalid status should be formatted to "${CoreLibrary.ValueState.None}"`,
      function (assert) {
        statusToStateCase.call(this, {
          assert: assert,
          status: "Missing",
          expected: CoreLibrary.ValueState.None,
        });
      }
    );
  }
);
