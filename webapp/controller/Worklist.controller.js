/*global location history */
sap.ui.define([
	"jetCources/Project/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"jetCources/Project/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("jetCources.Project.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function(oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());

		},

		onPressCreate: function(oEvent) {
			var that = this;
			var dialog =
				new sap.m.Dialog({
					title: "Create item",
					type: "Message",
					content: [
						new sap.m.Label({
							text: "MaterialText",
							design: "Bold",
							labelFor: "MaterialText"
						}),
						new sap.m.Input("MaterialText", {
							maxLength: 20,
							liveChange: function(oEvent) {
								var valueInput = oEvent.getParameter("value");
								var parent = oEvent.getSource().getParent();
								var valueGroupID = sap.ui.getCore().byId("GroupID").getValue();
								var valueSubGroupID = sap.ui.getCore().byId("SubGroupID").getValue();
								var valueInputLength = valueInput.split(" ").join("").length;
								var valueGroupIDLength = valueGroupID.split(" ").join("").length;
								var valueSubGroupIDLength = valueSubGroupID.split(" ").join("").length;
								if (valueInputLength > 0 && valueGroupIDLength > 0 && valueSubGroupIDLength > 0) {
									parent.getBeginButton().setEnabled(true);
								} else {
									parent.getBeginButton().setEnabled(false);
								}
							}
						}),
						new sap.m.Label({
							text: "GroupID",
							design: "Bold",
							labelFor: "GroupID"
						}),
						new sap.m.Input("GroupID", {
							maxLength: 2,
							liveChange: function(oEvent) {
								var valueInput = oEvent.getParameter("value");
								var parent = oEvent.getSource().getParent();
								var valueMaterialText = sap.ui.getCore().byId("MaterialText").getValue();
								var valueSubGroupID = sap.ui.getCore().byId("SubGroupID").getValue();
								var valueInputLength = valueInput.split(" ").join("").length;
								var valueMaterialTextLength = valueMaterialText.split(" ").join("").length;
								var valueSubGroupIDLength = valueSubGroupID.split(" ").join("").length;
								if (valueInputLength > 0 && valueMaterialTextLength > 0 && valueSubGroupIDLength > 0) {
									parent.getBeginButton().setEnabled(true);
								} else {
									parent.getBeginButton().setEnabled(false);
								}
							}
						}),
						new sap.m.Label({
							text: "SubGroupID",
							design: "Bold",
							labelFor: "SubGroupID"
						}),
						new sap.m.Input("SubGroupID", {
							maxLength: 2,
							liveChange: function(oEvent) {
								var valueInput = oEvent.getParameter("value");
								var parent = oEvent.getSource().getParent();
								var valueGroupID = sap.ui.getCore().byId("GroupID").getValue();
								var valueMaterialText = sap.ui.getCore().byId("MaterialText").getValue();
								var valueInputLength = valueInput.split(" ").join("").length;
								var valueGroupIDLength = valueGroupID.split(" ").join("").length;
								var valueMaterialTextLength = valueMaterialText.split(" ").join("").length;
								if (valueInputLength > 0 && valueGroupIDLength > 0 && valueMaterialTextLength > 0) {
									parent.getBeginButton().setEnabled(true);
								} else {
									parent.getBeginButton().setEnabled(false);
								}
							}
						})
					],
					beginButton: new sap.m.Button("btnCreate", {
						type: sap.m.ButtonType.Ghost,
						text: "Create",
						enabled: false,
						press: function() {
							dialog.close();
							var item = {
								MaterialID: "",
								MaterialText: dialog.getContent()[1].getValue(),
								GroupID: dialog.getContent()[3].getValue(),
								SubGroupID: dialog.getContent()[5].getValue(),
								Version: "A",
								Language: "RU"
							};
							that.getModel().create("/zjblessons_base_Materials", item, {
								success: function() {
									sap.m.MessageToast.show("Success");
								},
								error: function() {
									sap.m.MessageToast.show("Error");
								}
							});
						}
					}),
					endButton: new sap.m.Button({
						type: sap.m.ButtonType.Ghost,
						text: "Cancel",
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
			dialog.open();
		},
		onCheck: function() {
			var checkedItem = this.getView().byId("table").getSelectedItems()[0].getBindingContext().getObject().CreatedBy;
			if (checkedItem === "LAB1000007") {
				return true;
			} else return false;

		},
		onPressDelete: function(oEvent) {

			if (this.getView().byId("table").getSelectedItems().length === 0) {
				sap.m.MessageToast.show("Please,select item");

			} else {
				if (this.onCheck() === false) {
					sap.m.MessageToast.show("You should select item where 'CreatedBy' = LAB1000007");
				} else {
					var that = this;
					var deletedItem = this.getView().byId("table").getSelectedItems()[0].getBindingContext().getPath();
					var dialogDelete =
						new sap.m.Dialog({
							title: "Delete",
							type: "Message",
							content: new sap.m.Text({
								text: "Are you sure?"
							}),
							beginButton: new sap.m.Button({
								type: sap.m.ButtonType.Ghost,
								text: "Delete",
								press: function() {
									that.getModel().remove(deletedItem);
									dialogDelete.close();
								}
							}),
							endButton: new sap.m.Button({
								type: sap.m.ButtonType.Ghost,
								text: "Cancel",
								press: function() {
									dialogDelete.close();
								}
							}),
							afterClose: function() {
								dialogDelete.destroy();
							}
						});
				}
			}
			dialogDelete.open();
		},
		onPressUpdate: function(oEvent) {

			if (this.getView().byId("table").getSelectedItems().length === 0) {
				sap.m.MessageToast.show("Please,select item");

			} else {
				if (this.onCheck() === false) {
					sap.m.MessageToast.show("You should select item where 'CreatedBy' = LAB1000007");
				} else {
					var that = this;
					var UpdateItem = this.getView().byId("table").getSelectedItems()[0].getBindingContext().getPath();
					var dialogUpdate =
						new sap.m.Dialog({
							title: "Update",
							type: "Message",
							content: [
								new sap.m.Label({
									text: "MaterialText",
									design: "Bold",
									labelFor: "MaterialText"
								}),
								new sap.m.Input("MaterialTextUpdate", {
									maxLength: 20,
									liveChange: function(oEvent) {
										var valueInput = oEvent.getParameter("value");
										var parent = oEvent.getSource().getParent();
										var valueGroupID = sap.ui.getCore().byId("GroupIDUpdate").getValue();
										var valueSubGroupID = sap.ui.getCore().byId("SubGroupIDUpdate").getValue();
										var valueInputLength = valueInput.split(" ").join("").length;
										var valueGroupIDLength = valueGroupID.split(" ").join("").length;
										var valueSubGroupIDLength = valueSubGroupID.split(" ").join("").length;
										if (valueInputLength > 0 && valueGroupIDLength > 0 && valueSubGroupIDLength > 0) {
											parent.getBeginButton().setEnabled(true);
										} else {
											parent.getBeginButton().setEnabled(false);
										}
									}
								}),
								new sap.m.Label({
									text: "GroupID",
									design: "Bold",
									labelFor: "GroupID"
								}),
								new sap.m.Input("GroupIDUpdate", {
									maxLength: 2,
									liveChange: function(oEvent) {
										var valueInput = oEvent.getParameter("value");
										var parent = oEvent.getSource().getParent();
										var valueMaterialTextUpdate = sap.ui.getCore().byId("MaterialTextUpdate").getValue();
										var valueSubGroupID = sap.ui.getCore().byId("SubGroupIDUpdate").getValue();
										var valueInputLength = valueInput.split(" ").join("").length;
										var valueMaterialTextUpdateLength = valueMaterialTextUpdate.split(" ").join("").length;
										var valueSubGroupIDLength = valueSubGroupID.split(" ").join("").length;
										if (valueInputLength > 0 && valueMaterialTextUpdateLength > 0 && valueSubGroupIDLength > 0) {
											parent.getBeginButton().setEnabled(true);
										} else {
											parent.getBeginButton().setEnabled(false);
										}
									}
								}),
								new sap.m.Label({
									text: "SubGroupID",
									design: "Bold",
									labelFor: "SubGroupID"
								}),
								new sap.m.Input("SubGroupIDUpdate", {
									maxLength: 2,
									liveChange: function(oEvent) {
										var valueInput = oEvent.getParameter("value");
										var parent = oEvent.getSource().getParent();
										var valueGroupID = sap.ui.getCore().byId("GroupIDUpdate").getValue();
										var valueMaterialTextUpdate = sap.ui.getCore().byId("MaterialTextUpdate").getValue();
										var valueInputLength = valueInput.split(" ").join("").length;
										var valueGroupIDLength = valueGroupID.split(" ").join("").length;
										var valueMaterialTextUpdateLength = valueMaterialTextUpdate.split(" ").join("").length;
										if (valueInputLength > 0 && valueGroupIDLength > 0 && valueMaterialTextUpdateLength > 0) {
											parent.getBeginButton().setEnabled(true);
										} else {
											parent.getBeginButton().setEnabled(false);
										}
									}
								})
							],
							beginButton: new sap.m.Button({
								type: sap.m.ButtonType.Ghost,
								text: "Update",
								enabled: false,
								press: function() {

									var item = {
										MaterialText: dialogUpdate.getContent()[1].getValue(),
										GroupID: dialogUpdate.getContent()[3].getValue(),
										SubGroupID: dialogUpdate.getContent()[5].getValue()
									};
									that.getModel().update(UpdateItem, item, {
										success: function() {
											sap.m.MessageToast.show("Success");
										},
										error: function() {
											sap.m.MessageToast.show("Error");
										}
									});
									dialogUpdate.close();
								}
							}),
							endButton: new sap.m.Button({
								type: sap.m.ButtonType.Ghost,
								text: "Cancel",
								press: function() {
									dialogUpdate.close();
								}
							}),
							afterClose: function() {
								dialogUpdate.destroy();
							}
						});
				}
			}
			dialogUpdate.open();
		},

		onSearch: function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("SubGroupText", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},
		onSearchMaterialText: function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchStateText = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchStateText = [new Filter("MaterialText", FilterOperator.EQ, sQuery)];
				}
				this._applySearch(aTableSearchStateText);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function(oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("MaterialID")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});