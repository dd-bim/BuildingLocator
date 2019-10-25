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

For an introduction to the entire issue of georeferencing BIM please see the 
    - [Documentation](https://github.com/dd-bim/IfcGeoRef/blob/master/Documentation_v3.md) for the proposed Concept *Level of Georeferencing* as well as for the IfcGeorefChecker and the quick start guide on the [readme](https://github.com/dd-bim/IfcGeoRef) at the IfcGeoRefChecker project site. 

In the following the basic steps for the usage of the BuildingLocator are described
1. The IfcGeoRefChecker tool generates a JSON-File that contains 
   - The already existing georeference information (specified in the LoGeoRef classification) in the checked IFC-File. 
   - The extracted building footprint lines saved as a WKT-Polygon in local building site coordinates. 
   
   For updating the georeferencing information this file must be imported into the Building Locator at the first tab **1. Select File**

2. The present georeferencing can be reviewd by opening tab **2. Show Existing Georef Information** after a file has been imported.

3. Before the georeferencing information can be updated via the map it is very important to use the desired coordinate reference system. By default the Building Locator provides the following four map projections that cover Germany and parts of Europe:
    - UTM Zone 33N, EPSG:25833
    - UTM Zone 32N, EPSG:25832
    - WGS84 Lat/Lon, EPSG:4326
    - Web-Mercator, EPSG:3857

    By selecting one of the entries from the drop-down list the corresponding CRS is set in the map view.

    If you need another base map covering a different area of the world with a different CRS the Building Locator is also able to retrieve a custom WMS. To do so, tick the checkbox *Use Custom WMS*. After that the you can paste the URL of the WMS in the *WMS-URL* field. The avialable layers and CRS can be retrieved by clicking the *Query Capabilities* button. As soon as you select a different entry from the CRS Drop-Down menu an request is sent to [epsg.io](http://epsg.io) for retrieving the Proj4 Definition String. If you encounter any problems you can also modify this string manually.
    
    Once you are done with the settings press the **Save Custom WMS Settings** button. Afterwards the custom wms can be selectd from the map projection drop-down menu.  

4. The building footprint can be added to the map view using tab 4 **Position Building**. If the GeoRefChecker could extract an footprint geometry from the     IFC-File it is added to the output-file which is used as the input data in the Building Locator application. This geometry will then be displayed in         the **WKT Representation field**. By clicking the *Draw Building* button the footprint is added to the map.

   By clicking the *Zoom to Feature* button the map view is centered to the building footprint. You can select the footprint by clicking inside the geometry. A selected building is marked in purple. By default the move operation is activated. You can switch back and forth between moving and rotating by selecting the appropriate button in the top of the map view. 

5. Inside the *Query Building Address* tab you can retrieve the building's address. The Building Locator issues a request to the [Nominatim-Service](https://   nominatim.org) which basically is a reverse search through OpenStreetMap that gets the address which is closest to the project base point (the orange dot)   of the building footprint.  

6. The Building Locator is not able to update the newly added georeferencing info to the original IFC-File directly. Therefor you need to save your settings    after you have placed the building footprint properly in the *Save Position and Download File* tab. After saving your settings you can download the          modified JSON-file containing the change information that than must be imported in the GeoRefChecker application. 



## Note for the usage of custom WMS
It is possible to use a custom WMS as a basemap within the Web-Application. However, this is only possible if the WMS has CORS enabled since the application is requesting and parsing the capabilities of the WMS for determining which layers and CRS are available. 

The following list comprises some sample WMS that can be used with the BuildingLocator
- http://www.geoproxy.geoportal-th.de/geoproxy/services/DOP?REQUEST=GetCapabilities&service=WMS provides aerial images for the German State Thuringia.
- http://gaservices.ga.gov.au/site_1/services/Ausimage_Canberra_2014/ImageServer/WMSServer?request=GetCapabilities&service=WMS provides areal images for the Canberra region, Australia
- https://www.wms.nrw.de/geobasis/wms_nw_dop?SERVICE=WMS&request=getCapabilities



## Release

A pre-built and pre-release version of the locator is available under the release section. All basic functions should work in this version. However, undesirable side-effects can occur. If you find any bugs, please open an issue or even better a pull request.

