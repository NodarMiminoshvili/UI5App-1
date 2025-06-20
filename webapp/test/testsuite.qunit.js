sap.ui.define(function () {
  "use strict";

  return {
    name: "QUnit test suite",
    defaults: {
      page: "ui5://test-resources/nodar/miminoshvili/Test.qunit.html?testsuite={suite}&test={name}",
      qunit: {
        version: 2,
      },
      sinon: {
        version: 4,
      },
      ui5: {
        theme: "sap_horizon",
      },
      loader: {
        paths: {
          "nodar/miminoshvili": "../",
        },
      },
    },
    tests: {
      "unit/model/formatter": {
        title: "Unit test",
      },

      "integration/opaTests": {
        title: "Integration tests",
      },
    },
  };
});
