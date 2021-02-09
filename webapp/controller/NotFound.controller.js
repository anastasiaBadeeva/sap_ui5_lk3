sap.ui.define([
		"jetCources/Project/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("jetCources.Project.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);