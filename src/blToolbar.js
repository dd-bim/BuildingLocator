import {defaults as defaultControls, Control} from 'ol/control';

var customButton = (function (Control) {
  function customButton(opt_options) {
    var options = opt_options || {};

    var button = document.createElement('button');
    button.innerHTML = "buttonDescr";

    var element = document.createElement('div');
    element.className = 'bl-toolbar';
    element.appendChild(button);

    Control.call(this, {
      element: element,
      target: options.target
    });

    button.addEventListener('click', alert('hi'), false);
  }


  if (Control) customButton.__proto__ = Control;
  customButton.prototype = Object.create(Control && Control.prototype);
  customButton.prototype.constructor = customButton;

  return customButton;

}(Control));