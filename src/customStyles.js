import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import Point from 'ol/geom/Point';


export function getSelectStyle() {

  var styles = [
    /* We are using two different styles for the polygons:
     *  - The first style is for the polygons themselves.
     *  - The second style is to draw the vertices of the polygons.
     *    In a custom `geometry` function the vertices of a polygon are
     *    returned as `MultiPoint` geometry, which will be used to render
     *    the style.
     */
    new Style({
      stroke: new Stroke({
        color: 'blue',
        width: 3
      }),
      fill: new Fill({
        color: 'rgba(255, 0, 255, 0.75)'
      })
    }),
    new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({
          color: 'orange'
        })
      }),
      geometry: function(feature) {
        // return the coordinates of the first ring of the polygon
        var coordinates = feature.getGeometry().getCoordinates()[0][0];
        return new Point(coordinates);
      }
    })
  ];

  return styles;

}

export function getDeleteStyle() {

  var customStyle = new Style({
    stroke: new Stroke({
      color: 'transparent'
    }),
    fill: new Fill({
      color: 'transparent'
    })
  });

  return customStyle;

}