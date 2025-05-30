/**
 * @description Main component of the application.
 * @extends sap.ui.core.UIComponent
 * @public
 */
sap.ui.define(["sap/ui/core/UIComponent"], (UIComponent) => {
  "use strict";

  /**
   * Extends the base UIComponent to define the application component.
   *
   * @extends sap.ui.core.UIComponent
   */
  return UIComponent.extend("nodar.miminoshvili.Component", {
    /**
     * @public
     * @returns {object} The metadata definition.
     */
    metadata: {
      interfaces: ["sap.ui.core.IAsyncContentCreation"],
      manifest: "json",
    },

    /**
     * Called during the component initialization. Initializes the router.
     *
     * @public
     */
    init() {
      UIComponent.prototype.init.apply(this, arguments);

      this.getRouter().initialize();
    },
  });
});
