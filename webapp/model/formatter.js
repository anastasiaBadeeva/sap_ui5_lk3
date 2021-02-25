sap.ui.define([], function() {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		formatRadioBtn: function(sValue) {
			return sValue !== null ? parseInt(sValue, 10) - 1 : -1;
		},
		formatModified: function(user, data, evt) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy.MM.dd"
			});
			var dataFormatted = oDateFormat.format(data);
			if (user !== null && user !== undefined) {
				var newUser = user.replace(/LAB/g, "");
			};
			var today = new Date();
			var createdOn = new Date(data);
			var msInDay = 24 * 60 * 60 * 1000;

			createdOn.setHours(0, 0, 0, 0);
			today.setHours(0, 0, 0, 0)

			var diff = (+today - +createdOn) / msInDay
			return `${this.getModel("i18n").getResourceBundle().getText("labelModifiedBy")} ${newUser} on ${dataFormatted} modified ${diff} days ago`;
		},
		formatCreated: function(user, data) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy.MM.dd"
			});
			var dataFormatted = oDateFormat.format(data);
			if (user !== null && user !== undefined) {
				var newUser = user.replace(/LAB/g, "");
			};
			var today = new Date();
			var createdOn = new Date(data);
			var msInDay = 24 * 60 * 60 * 1000;

			createdOn.setHours(0, 0, 0, 0);
			today.setHours(0, 0, 0, 0)

			var diff = (+today - +createdOn) / msInDay
			return `${this.getModel("i18n").getResourceBundle().getText("labelCreatedBy")} ${newUser} on ${dataFormatted} created ${diff} days ago`;
		},
		

	};

});