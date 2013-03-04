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

    map: null,

    currentBaseLayer: null,

    baseLayers: null,

    currentTimer: null,

    deleteMouseDownDelay: 1000,

    // Application Constructor
    initialize: function() {
        this.bindEvents();
        this.baseLayers = [];
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $(document).ready(this.onDocumentReady);
    },

    onDocumentReady: function() {
        console.log("document ready!");

        app.createMap();
        app.manageOrientation();
        app.manageTMSAddition();
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log("device ready!");
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

    createMap: function() {
        // initial base layers
        app.baseLayers.push({
            name: "OSM Standard",
            layerObj: L.tileLayer(
                'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                {
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'

                }
            )
        });
        app.baseLayers.push({
            name: "OSM Cycle Map",
            layerObj: L.tileLayer(
                'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                {
                    attribution: 'Tiles courtesy of <a href="http://www.opencyclemap.org/" target="_blank">Andy Allan</a>'
                }
            )
        });
        
        app.map = new L.Map('map', {
            center: new L.LatLng(48.41, -71.09),
            zoom: 13,
            layers: app.baseLayers[0].layerObj
        });

        app.currentBaseLayer = app.baseLayers[0];

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
            $('#textinput-addtmslayer-url')[0].value = "http://cartalib.mapgears.com/mapcache/tms/1.0.0/colorpink_v1@g/{z}/{x}/{y}.png";
        });
    },

    addTMSLayer: function() {
        var name,
            url,
            layer;
        name = $('#textinput-addtmslayer-name')[0].value;
        url = $('#textinput-addtmslayer-url')[0].value;

        if (name == "" || url == "") {
            return;
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

        // TODO: remove from database

        layerToDelete.$item.remove();
    }
};
