/*global location*/
sap.ui.define([
	"jetCources/Project/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"jetCources/Project/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(
	BaseController,
	JSONModel,
	History,
	formatter,
	MessageToast,
	MessageBox
) {
	"use strict";

	return BaseController.extend("jetCources.Project.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0,
					enableChanges: false,
					selectedTab: "List",
					editChanges: false,
					flag: false
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
			// var oModel = new JSONModel(sap.ui.require.toUrl("zjblessons_base_Materials"));
			// this.getView().setModel(oModel);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("zjblessons_base_Materials", {
					MaterialID: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function(sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oDataModel.metadataLoaded().then(function() {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		onPressBack: function() {
			this.getRouter().navTo("worklist");
		},
		// onChangeSwitch: function(oEvent) {
		// 	var switchBtn = oEvent.getSource().getState();
		// 	this.getModel("objectView").setProperty("/enableChanges", switchBtn);
		// },
		onPressRefresh: function(oEvent) {

			this.getModel().refresh(true);
		},
		onPressReset: function(oEvent) {
			this.getModel().resetChanges();
		},
		onPressSubmit: function(oEvent) {
			var sPath = this.getView().getBindingContext().getPath() + "/";
			var valueMaterialText = this.getView().byId("materialTextInp").getValue();
			var valueGroupID = this.getView().byId("radioBtnGroup").getSelectedIndex() + 1;
			var valueSubGroupID = this.getView().byId("subGroupIDInp").getValue();
			var valueIntegrationID = this.getView().byId("integrationIDInp").getValue();
			this.getModel().setProperty(sPath + "MaterialText", valueMaterialText);
			this.getModel().setProperty(sPath + "GroupID", valueGroupID.toString());
			this.getModel().setProperty(sPath + "SubGroupID", valueSubGroupID);
			this.getModel().setProperty(sPath + "IntegrationID", valueIntegrationID);
			this.getModel().submitChanges();
		},
		onEditToggled: function(oEvent) {
			var editableForm = oEvent.getParameter("editable");
			var that = this;
			this.getModel("objectView").setProperty("/enableChanges", editableForm);
			var flag = this.getModel("objectView").getProperty("/flag");
			if (!editableForm && !flag) {
				MessageBox.confirm("Save changes?", {
					title: "Save changes?",
					initialFocus: sap.m.MessageBox.Action.OK,
					onClose: function(sButton) {
						if (sButton === MessageBox.Action.OK) {
							MessageToast.show("Changes  save");
							that.getModel().submitChanges();
						} else if (sButton === MessageBox.Action.CANCEL) {
							MessageToast.show("Changes didn't save");
							that.getModel().resetChanges();
						}
					}
				});

			}

		},
		onSave: function(oEvent) {
			this.getModel("objectView").setProperty("/flag", false);
			this.getModel("objectView").setProperty("/editChanges", false);
		},
		onCancel: function(oEvent) {
			this.getModel("objectView").setProperty("/editChanges", false);
			this.getModel("objectView").setProperty("/flag", false);
			MessageToast.show("Changes didn't save");
		},
		onEdit: function(oEvent) {
			this.getModel("objectView").setProperty("/editChanges", true);
			this.getModel("objectView").setProperty("/flag", true);
		},
		onChangeGroup: function(oEvent) {
			var valuedSelected = oEvent.getSource().getValue();
			MessageToast.show(this.getModel("i18n").getResourceBundle().getText("labelSelected") + " " + valuedSelected);
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.MaterialID,
				sObjectName = oObject.MaterialText;

			oViewModel.setProperty("/busy", false);

			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		}

	});

});