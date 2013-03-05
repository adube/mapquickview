MapQuickView
============

MapQuickView is a PhoneGap mapping application that allows the importation of
TMS layers from remote servers to quickly view what they look like on a phone.

PhoneGap plugin - AppPreferences
--------------------------------

The [AppPreferences PhoneGap plugin][1] was used to save the layers
added/removed. The installation procedures were follow and I had to update
the project directoy using these commands:

    android list targets
    android update project --path $(pwd) --target 4 --subprojects


References
----------

*   [AppPreferences GitHub repository][1]
*   [AppPreferences version used][2] in this application

[1]: https://github.com/macdonst/AppPreferences
[2]: https://github.com/macdonst/AppPreferences/commit/bbe9c9b28753b07510ad83461b093747c8c68d47
