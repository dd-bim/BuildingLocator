import {Circle as CircleStyle} from 'ol/style.js';
import Style from 'ol/style/Style';
import RegularShape from 'ol/style/RegularShape'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import WKT from 'ol/format/wkt';

import $ from 'jquery';

import {getProjectBasePointFromFeature} from './buildingLocator';


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
        radius: 7.5,
        fill: new Fill({
          color: 'orange'
        })
      }),
      geometry: function(feature) {
        var coords = getProjectBasePointFromFeature(feature);
        return coords;
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

export function getRotateStyle() {
  let white = [ 255, 255, 255, 0.8 ]
  let blue = [ 0, 153, 255, 0.8 ]
  let red = [ 209, 0, 26, 0.9 ]
  let width = 2

  let styles = {
    anchor: [
      new Style({
        image: new RegularShape({
          fill: new Fill({
            color: blue
          }),
          stroke: new Stroke({
            color: blue,
            width: 1
          }),
          radius: 4,
          points: 6
        }),
        zIndex: Infinity
      })
    ],
    arrow: [
      new Style({
        stroke: new Stroke({
          color: white,
          width: width + 3,
          lineDash: [ 10, 10 ]
        }),
        text: new Text({
          font: '14px sans-serif',
          offsetX: 25,
          offsetY: -25,
          fill: new Fill({
            color: 'blue'
          }),
          stroke: new Stroke({
            color: white,
            width: width + 1
          })
        }),
        zIndex: Infinity
      }),
      new Style({
        stroke: new Stroke({
          color: red,
          width: width + 1,
          lineDash: [ 10, 10 ]
        }),
        zIndex: Infinity
      })
    ]
  }
  return function (feature, resolution) {
    let style
    let angle = feature.get('angle') || 0

    switch (true) {
      case feature.get('rotate-anchor'):
        style = styles[ 'anchor' ]
        style[ 0 ].getImage().setRotation(-angle)

        return style
      case feature.get('rotate-arrow'):
        style = styles[ 'arrow' ]

        let coordinates = feature.getGeometry().getCoordinates()
        // generate arrow polygon
        let geom = new LineString([
          coordinates,
          [ coordinates[ 0 ], coordinates[ 1 ] + 100 * resolution ]
        ])

        // and rotate it according to current angle
        geom.rotate(angle, coordinates)
        style[ 0 ].setGeometry(geom)
        style[ 1 ].setGeometry(geom)
        style[ 0 ].getText().setText(Math.round(-angle * 180 / Math.PI) + '°')

        return style
    }
  }
}