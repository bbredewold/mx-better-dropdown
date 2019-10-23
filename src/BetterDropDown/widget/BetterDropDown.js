/*global logger*/
/*
    BetterDropDown
    ========================

    @file      : BetterDropDown.js
    @version   : 1.0.0
    @author    : B.R. Bredewold
    @date      : 2019-10-23
    @copyright : <Your Company> 2016
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "dojo/on",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/lang",

], function (declare, _WidgetBase, dojoOn, dojoStyle, dojoConstruct, lang) {
    "use strict";

    // Declare widget's prototype.
    return declare("BetterDropDown.widget.BetterDropDown", [ _WidgetBase ], {

        // Internal variables.
        _handles: null,
        _contextObj: null,

        // Modeler Input
        activateOnCount: 0,

        _dropDownSelector: ".mx-dropdown",
        _dropDownInitializedClassName: "mx-better-drop-down-initialized",
        _domElementWrapperId: "mx-better-drop-down-wrapper",

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");

            // Setup MutationObserver for reacting on dropdowns appearing in DOM.
            var observer = new MutationObserver(this._mutationObserverCallback.bind(this));
            observer.observe(document.body, { childList: true});
        },

        _mutationObserverCallback: function(mutations) {
            if (mutations[0].addedNodes.length) {
                var dropDown = document.querySelector(this._dropDownSelector);
                var domElementWrapperId = this._domElementWrapperId;

                // Check if dropDown selector exists.
                if (!dropDown) {
                    return;
                }

                // Get all childNodes from dropdown-list.
                var childNodes = Array.from(dropDown.childNodes).filter(function(node) {
                    return node.nodeName.toLowerCase() === "li" && node.id !== domElementWrapperId;
                });

                // Don't add search if childNodes.length is below threshold.
                if (childNodes.length < this.activateOnCount) {
                    return;
                }

                // Check if dropDown already was initialized.
                if (!dropDown.classList.contains(this._dropDownInitializedClassName)) {

                    // Create UI DOM elements.
                    var domLi = dojoConstruct.toDom('<li style="display: flex; padding: 5px 10px;" id="'+ this._domElementWrapperId +'"></li>');
                    var domInput = dojoConstruct.toDom('<input type="text" class="form-control" style="width: 100%; cursor: auto;" placeholder="Zoek...">');
                    var domButton = dojoConstruct.toDom('<button class="btn" style="margin-left: 5px; padding: 5px 10px;"><span class="glyphicon glyphicon-unchecked"></span></button>');

                    // Add search element to DOM.
                    dojoConstruct.place(domInput, domLi, 'first');
                    dojoConstruct.place(domButton, domLi, 'last');
                    dojoConstruct.place(domLi, dropDown, 'first');

                    // Stop the click event from propagation.
                    dojoOn(domLi, 'click', function(e){
                        e.stopPropagation();
                    });

                    // Search by keyup
                    dojoOn(domInput, 'keyup', function(e){
                        dropDown.childNodes.forEach(function(el) {
                            if (el.nodeName.toLowerCase() === "li" && el.id !== domElementWrapperId) {
                                var label = el.querySelector("label");
                                if (label) {
                                    var labelValue = label.innerHTML.toLowerCase();
                                    el.style.display = labelValue.indexOf(domInput.value) !== -1 ? "list-item" : "none";
                                }
                            }
                        });
                    });

                    // Stop the click event from propagation.
                    dojoOn(domButton, 'click', function(e){
                        var nodes = childNodes.filter(function(node) {
                            return node.style.display !== 'none';
                        });

                        var checkedNodes = nodes.filter(function(node) {
                            return node.querySelector('input').checked;
                        });

                        var uncheckedNodes = nodes.filter(function(node) {
                            return !node.querySelector('input').checked;
                        });

                        if (checkedNodes.length > 0 && checkedNodes.length < nodes.length) {
                            uncheckedNodes.forEach(function(node) {
                                node.querySelector('input').click();
                            });
                        } else {
                            nodes.forEach(function(node) {
                                node.querySelector('input').click();
                            });
                        }
                    });

                    // Set dropdown to initialized, to prevent re-initializing.
                    dropDown.classList.add(this._dropDownInitializedClassName);
                }

                setTimeout(function() {
                    dropDown.querySelector('input').focus();
                }, 75);

            }
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._updateRendering(callback);
        },

        resize: function (box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function () {
            logger.debug(this.id + ".uninitialize");
        },

        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback, "_updateRendering");
        },

        // Shorthand for running a microflow
        _execMf: function (mf, guid, cb) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function (objs) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }
                    }),
                    error: function (error) {
                        console.debug(error.description);
                    }
                }, this);
            }
        },

        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["BetterDropDown/widget/BetterDropDown"]);
