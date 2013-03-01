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
var app = {

    map: null,

    currentBaseLayer: null,

    baseLayers: null,

    overlayLayers: null,

    // Application Constructor
    initialize: function() {
        this.bindEvents();
        this.baseLayers = [];
        this.overlayLayers = [];
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
        app.createMap();
        app.manageOrientation();
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
        console.log("ADUBE - fixContentHeight");

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

        $('<li>', {
                "data-role": "list-divider",
                text: "Overlay Layers"
            })
            .appendTo('#layerslist');
        $.each(app.overlayLayers, function(index, layer) {
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
                .click(function() {
                    $.mobile.changePage('#mappage');
                    if ($.inArray(layer, app.baseLayers)) {
                        app.setBaseLayer(layer);
                    } else {
                        // todo...
                        //layer.setVisibility(!layer.getVisibility());
                    }
                })
            )
            .appendTo('#layerslist');

        layer.$item = $(item);
    
        // todo - support this as well
        /*
        layer.events.on({
            'visibilitychanged': function() {
                $(item).toggleClass('checked');
            }
        });
        */
    },

    setBaseLayer: function(layer) {
        // remove current base layer
        app.map.removeLayer(app.currentBaseLayer.layerObj);
        app.currentBaseLayer.$item.toggleClass('checked');

        // set new base layer
        app.map.addLayer(layer.layerObj);
        layer.$item.toggleClass('checked');
        app.currentBaseLayer = layer;
    }
};
