MapQuickView
============

MapQuickView is an mobile mapping application prototype built with PhoneGap,
jQuery.mobile and Leaflet that allows the importation of tiled layers from
remote TMS servers to quickly view what they look like on your mobile device.

Its primal goal was to let me try the above technologies and learn more about
them. As mentiioned, this is a prototype.

Quick preview
-------------

You can quickly [see what the application looks like][3].

Install
-------

[Install MapQuickView v0.2][4] on your Android device.

About AppPreferences
--------------------

The [AppPreferences PhoneGap plugin][1] was used to save the layers
added/removed. The installation procedures were follow and I had to update
the project directoy using these commands:

    android list targets
    android update project --path $(pwd) --target 4 --subprojects


References
----------

*   [MapQuickView 0.2 - see it live (web version)][3]
*   [Install v0.2 - MapQuickView-0.2.apk][4]
*   [AppPreferences GitHub repository][1]
*   [AppPreferences version used][2] in this application

[1]: https://github.com/macdonst/AppPreferences
[2]: https://github.com/macdonst/AppPreferences/commit/bbe9c9b28753b07510ad83461b093747c8c68d47
[3]: http://dev5.mapgears.com/mapquickview/0.2/
[4]: http://dl.mapgears.com/mapquickview/0.2/MapQuickView-0.2.apk