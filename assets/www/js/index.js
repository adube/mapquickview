/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Start with the map page
window.location.replace(window.location.href.split("#")[0] + "#");

var app = {

    baseLayers: null,

    currentBaseLayer: null,

    currentTimer: null,

    deleteMouseDownDelay: 1000,

    isMobileDevice: false,

    map: null,

    preference: null,

    // Application Constructor
    initialize: function() {
        this.bindEvents();
        this.detectUserAgent();
        this.baseLayers = [];
        this.preference = window.plugins.applicationPreference;
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $(document).ready(this.onDocumentReady);
    },

    detectUserAgent: function() {
        app.isMobileDevice = (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(
            navigator.userAgent)) ? true : false;
    },

    onDocumentReady: function() {
        console.log("document ready!");

        // if not on a mobile device, create the map right away with the
        // default (and static) preferences. On a mobile device, the preferences
        // are loaded first, then the map is created
        if (!app.isMobileDevice) {
            app.createMap(app.getDefaultPreferences());
        }
        app.manageOrientation();
        app.manageTMSAddition();
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log("device ready!");
        app.loadPreferences();
    },

    loadPreferences: function() {
        // reset - for dev debug use only
        // app.resetPreferences();

        app.preference.load(function(pref) {
            pref = pref || {};
            console.log("mqvjs - preferences: " + JSON.stringify(pref));
            // if no layers were found in preferences, get default ones and
            // save them
            if (!pref.layers) {
                console.log("mqvjs - no preferences found, use default");
                pref = app.getDefaultPreferences();
                app.savePreferences(pref);
            }
            app.createMap(pref);
        }, function() {
            console.log("mqvjs - error, preferences not loaded");
        });
    },

    getDefaultPreferences: function() {
        return {
            layers: JSON.stringify([{
                "name": "OSM Standard",
                "url": "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
                "attribution": '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                "tms": false
            }, {
                "name": "OSM Cycle Map",
                "url": "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
                "attribution": 'Tiles courtesy of <a href="http://www.opencyclemap.org/" target="_blank">Andy Allan</a>',
                "tms": false
            }]),
            x: 48.41,
            y: -71.09,
            z: 13,
            currentlayer: "OSM Standard"
        };
    },

    savePreferences: function(pref) {
        pref = pref || {};
        console.log("mqvjs - save preferences: " + JSON.stringify(pref));
        $.each(pref, function(key, value) {
            app.preference.set(key, value, function() {
                if (typeof value == "object") {
                    value = JSON.stringify(value);
                }
                console.log("mqvjs - preferences '" + key + "' set.");
            }, function() {
                console.log("mqvjs - preferences '" + key + "' not set.");
            });
        });
    },

    saveBaseLayers: function() {
        var layers = [],
            layer;

        if (!app.isMobileDevice) {
            console.log("mqvjs - device is not a mobile - layers not saved");
            return;
        }
        
        $.each(app.baseLayers, function(index, baseLayer) {
            layer = {
                name: baseLayer.name,
                url: baseLayer.layerObj._url,
                tms: baseLayer.layerObj.options.tms
            };
            if (baseLayer.layerObj.options.attribution) {
                layer.attribution = baseLayer.layerObj.options.attribution;
            }
            layers.push(layer);
        });
        app.savePreferences({layers: layers});
    },

    saveCurrentBaseLayer: function() {
        if (!app.isMobileDevice) {
            console.log(
                "mqvjs - device is not aaaa mobile - current base layer not saved"
            );
            return;
        }
        app.savePreferences({currentlayer: app.currentBaseLayer.name});
    },

    resetPreferences: function() {
        app.savePreferences({
            x: "",
            y: "",
            z: "",
            currentlayer: "",
            layers: ""
        });

        // load
        app.preference.load(function(value) {
            console.log("mqvjs - preferences: " + JSON.stringify(value))
        }, function() {
            console.log("mqvjs - error, preferences not loaded");
        });
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    createMap: function(pref) {
        var options,
            currentLayer,
            baseLayer;
        pref = pref || {};

        if (app.map || !pref.layers) {
            return;
        }

        $.each(JSON.parse(pref.layers), function(index, layer) {
            options = {
                tms: layer.tms
            };
            if (layer.attribution) {
                options.attribution = layer.attribution;
            }
            baseLayer = {
                name: layer.name,
                layerObj: L.tileLayer(layer.url, options)
            };
            app.baseLayers.push(baseLayer);

            if (layer.name == pref.currentlayer) {
                app.currentBaseLayer = baseLayer;
            }
        });
        
        if (!app.currentBaseLayer) {
            app.currentBaseLayer = app.baseLayers[0];
        }
        
        app.map = new L.Map('map', {
            center: new L.LatLng(pref.x, pref.y),
            zoom: pref.z,
            layers: app.currentBaseLayer.layerObj
        });

        // initialize the layer list
        app.initLayerList();
    },

    manageOrientation: function() {
        $(window).bind(
            "orientationchange resize pageshow",
            app.fixContentHeight
        );
        app.fixContentHeight();
    },

    fixContentHeight: function() {
        var footer = $("div[data-role='footer']:visible"),
            content = $("div[data-role='content']:visible:visible"),
            viewHeight = $(window).height(),
            contentHeight = viewHeight - footer.outerHeight();

        if ((content.outerHeight() + footer.outerHeight()) !== viewHeight) {
            contentHeight -= (content.outerHeight() - content.height() + 1);
            content.height(contentHeight);
        }
    },

    initLayerList: function() {
        $('#layerspage').page();
        $('<li>', {
                "data-role": "list-divider",
                text: "Base Layers"
            })
            .appendTo('#layerslist');
        $.each(app.baseLayers, function(index, layer) {
            app.addLayerToList(layer);
        });

        $('#layerslist').listview('refresh');
    },

    addLayerToList: function(layer) {
        var item = $('<li>', {
                "data-icon": "check",
                "class": app.map.hasLayer(layer.layerObj) ? "checked" : ""
            })
            .append($('<a />', {
                text: layer.name
            })
                // standard mouse events
                .mousedown(function() {
                    if (!app.currentTimer) {
                        app.currentTimer = window.setTimeout(function() {
                            console.log("delete!");
                            app.deleteTMSLayer(layer);
                            app.currentTimer = null;
                        }, app.deleteMouseDownDelay);
                    }
                })

                .mouseup(function() {
                    if (app.currentTimer) {
                        window.clearTimeout(app.currentTimer);
                        app.currentTimer = null;
                        $.mobile.changePage('#mappage');
                        app.setBaseLayer(layer);
                        return false;
                    }
                })

                // touch events
                .bind("touchstart", function() {
                    if (!app.currentTimer) {
                        app.currentTimer = window.setTimeout(function() {
                            console.log("delete on touch!");
                            app.deleteTMSLayer(layer);
                            app.currentTimer = null;
                        }, app.deleteMouseDownDelay);
                    }
                })

                .bind("touchend", function() {
                    console.log("touchend");
                    if (app.currentTimer) {
                        window.clearTimeout(app.currentTimer);
                        app.currentTimer = null;
                        $.mobile.changePage('#mappage');
                        app.setBaseLayer(layer);
                        return false;
                    }
                })


            )
            .appendTo('#layerslist');

        layer.$item = $(item);

        $('#layerslist').listview('refresh');
    },

    setBaseLayer: function(layer) {
        // remove current base layer
        app.map.removeLayer(app.currentBaseLayer.layerObj);
        app.currentBaseLayer.$item.toggleClass('checked');

        // set new base layer
        app.map.addLayer(layer.layerObj);
        layer.$item.toggleClass('checked');
        app.currentBaseLayer = layer;

        // save 'currentlayer' to preferences
        app.saveCurrentBaseLayer();
    },

    manageTMSAddition: function() {
        // on 'confirm' click
        $('#buttoninput-addtmslayer-confirm').click(function() {
            app.addTMSLayer();
        });

        // on 'cancel' click
        $('#buttoninput-addtmslayer-cancel').click(function() {
            $.mobile.changePage('#mappage');
        });

        // on 'reset' click
        $('#buttoninput-addtmslayer-reset').click(function() {
            $('#textinput-addtmslayer-name')[0].value = "";
            $('#textinput-addtmslayer-url')[0].value = "";
        });

        // on 'pink one example' click
        $('#buttoninput-addtmslayer-pink').click(function() {
            $('#textinput-addtmslayer-name')[0].value = "Color Pink";
            $('#textinput-addtmslayer-url')[0].value = "http://cartalib.mapgears.com/mapcache/tms/1.0.0/colorpink_v1@g/";
        });
    },

    addTMSLayer: function() {
        var name,
            url,
            layer,
            urlPattern;
        name = $('#textinput-addtmslayer-name')[0].value;
        url = $('#textinput-addtmslayer-url')[0].value;

        if (name == "" || url == "") {
            return;
        }

        // ajust url if incomplete
        urlPattern = new RegExp("/{z}/{x}/{y}.[\w]+$");
        if (!urlPattern.test(url)) {
            var v = [url];
            urlPattern = new RegExp("/$");
            if (!urlPattern.test(url)) {
                v.push("/");
            }
            v.push("{z}/{x}/{y}.png");
            $('#textinput-addtmslayer-url')[0].value = v.join("");
            url = $('#textinput-addtmslayer-url')[0].value;
        }

        layer = {
            name: name,
            layerObj: L.tileLayer(
                url,
                {
                    tms: true
                }
            )
        }
        app.baseLayers.push(layer);
        app.addLayerToList(layer);
        app.setBaseLayer(layer);
        $.mobile.changePage('#mappage');

        // save 'layers' changes (only) to preferences
        app.saveBaseLayers();
    },

    deleteTMSLayer: function(layerToDelete) {      
        var index,
            msg = [];

        // do not delete anything if we only have one layer left
        if (app.baseLayers.length <= 1) {
            return;
        }

        // confirm deletion
        var msg = [];
        msg.push('Delete "');
        msg.push(layerToDelete.name);
        msg.push('" layer?')
        if (!confirm(msg.join(""))) {
            return;
        }

        // if layer is currently on the map, we must pick an other one
        if (app.map.hasLayer(layerToDelete.layerObj)) {
            $.each(app.baseLayers, function(index, layer) {
                if (layer.layerObj != layerToDelete.layerObj) {
                    app.setBaseLayer(layer);
                    return false;
                }   
            });
        }

        // remove from local layer array
        index = $.inArray(layerToDelete, app.baseLayers);
        app.baseLayers.splice(index, 1);

        layerToDelete.$item.remove();

        // save 'layers' changes (only) to preferences
        app.saveBaseLayers();
    }
};
