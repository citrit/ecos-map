import { Control } from 'ol/control.js';

//
// Define layer control.
//

export class SwitchLayerControl extends Control {
    /**
     * @param {Object} [opt_options] Control options.
     */
    constructor(opt_options, gpxFiles) {
        const options = opt_options || {};

        var radio = null;
        const layDiv = document.createElement('div');
        layDiv.className = 'switch-layer ol-unselectable ol-control';

        gpxFiles.forEach((layStr) => {
            radio = document.createElement('radio');
            radio.innerHTML = layStr;
            radio.id = layStr.toLowerCase();
            radio.name = "layerSwitch";
            layDiv.appendChild(radio);
        });
        super({
            element: layDiv,
            target: options.target,
        });
        layDiv.childNodes.forEach((child) => {
            child.addEventListener('click', this.switchLayer.bind(this), false);
          });
    }

    switchLayer(radio) {
        console.log(radio.srcElement.innerText);
    }
}
