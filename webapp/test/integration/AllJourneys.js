/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"jetCources/Project/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"jetCources/Project/test/integration/pages/Worklist",
	"jetCources/Project/test/integration/pages/Object",
	"jetCources/Project/test/integration/pages/NotFound",
	"jetCources/Project/test/integration/pages/Browser",
	"jetCources/Project/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "jetCources.Project.view."
	});

	sap.ui.require([
		"jetCources/Project/test/integration/WorklistJourney",
		"jetCources/Project/test/integration/ObjectJourney",
		"jetCources/Project/test/integration/NavigationJourney",
		"jetCources/Project/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});