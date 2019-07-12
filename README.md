# HTW Dresden BuildingLocator

The HTW Dresden BuildingLocator is a simple Web-Application for updating or creating georeferencing information for IFC-based building models. It should be used in conjunction with the HTW Dresden [GeoRefChecker](https://github.com/dd-bim/IfcGeoRef)



## Dependencies

- [OpenLayers](https://openlayers.org)
- [jQuery](https://jquery.com)
- [ol-rotate-feature](https://ghettovoice.github.io/ol-rotate-feature/)
- [Proj4JS](http://proj4js.org)

## Installation 

The repository contains a package.json for the easy installation with npm. Inside the root folder just use these commands for installing:

1. `npm install`
2. `npm run-script start`

If you want to build the application you can use the build script:

`npm run-script build`



## Documentation / Quickguide

For an introduction to the entire issue of georeferencing BIM please see the [documentation](https://github.com/dd-bim/IfcGeoRef/blob/master/Documentation_v3.md) and the quick start guide on the [readme](https://github.com/dd-bim/IfcGeoRef) at the IfcGeoRefChecker project site. 

In the following the basic steps for the usage of the BuildingLocator are described
1. The IfcGeoRefChecker tool generates a JSON-File that contains 
   - The existing georeference information
   - The extracted building contour lines saved as a WKT-Polygon in local building site coordinates. The origin of the 



## Note for the usage of custom WMS
It is possible to use a custom WMS as a basemap within the Web-Application. However, this is only possible if the WMS has CORS enabled since the application is requesting and parsing the capabilities of the WMS for determining which layers and CRS are available. 

The following list comprises some sample WMS that can be used with the BuildingLocator
- http://www.geoproxy.geoportal-th.de/geoproxy/services/DOP?REQUEST=GetCapabilities&service=WMS provides aerial images for the German State Thuringia.
- http://gaservices.ga.gov.au/site_1/services/Ausimage_Canberra_2014/ImageServer/WMSServer?request=GetCapabilities&service=WMS provides areal images for the Canberra region, Australia
- https://www.wms.nrw.de/geobasis/wms_nw_dop?SERVICE=WMS&request=getCapabilities



## Release

A pre-built and pre-release version of the locator is available under the release section. All basic functions should work in this version. However, undesirable side-effects can occur. If you find any bugs, please open an issue or even better a pull request.

