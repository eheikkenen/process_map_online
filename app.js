function drawLPBFProcessMap() {
  // Read material parameters from the input boxes
  const rho = parseFloat(document.getElementById('rho').value);
  const c = parseFloat(document.getElementById('c').value);
  const tf = parseFloat(document.getElementById('tf').value);
  const a = parseFloat(document.getElementById('a').value);
  const hs = parseFloat(document.getElementById('hs').value) * 1e3;
  const d_l = parseFloat(document.getElementById('d_l').value);

  // Read process inputs from the input boxes
  const t0 = parseFloat(document.getElementById('t0').value);
  const hatch = parseFloat(document.getElementById('hatch').value) * 1e-6;
  const layer = parseFloat(document.getElementById('layer').value) * 1e-6;
  const sigma = parseFloat(document.getElementById('sigma').value) * 1e-6;

  // Read simulation parameters
  const pmin = parseFloat(document.getElementById('pmin').value);
  const pmax = parseFloat(document.getElementById('pmax').value);
  const vmin = parseFloat(document.getElementById('vmin').value);
  const vmax = parseFloat(document.getElementById('vmax').value);

  // hardcode array size
  const n = 500;

  // Create linspace arrays for power and velocity
  function linspace(start, end, num) {
    const arr = [];
    const step = (end - start) / (num - 1);
    for (let i = 0; i < num; i++) {
      arr.push(start + step * i);
    }
    return arr;
  }

  const power = linspace(pmin, pmax, n);
  const velocity = linspace(vmin, vmax, n);

  // Initialize arrays for criteria and process map
  const tb = [];
  const king = [];
  const mapData = [];

  for (let i = 0; i < n; i++) {
    tb[i] = [];
    king[i] = [];
    mapData[i] = [];
    for (let j = 0; j < n; j++) {
      const p = power[i];
      const v = velocity[j];

      const q = a * p; // absorbed power [W]
      const d = Math.sqrt((2 * q) / (Math.E * Math.PI * rho * c * (tf - t0) * v));
      const w = 2 * d;

      // Tang-Pistorius-Beuth lack-of-fusion criterion
      // [1] M. Tang, P.C. Pistorius, J.L. Beuth, Prediction of lack-of-fusion porosity for powder bed fusion, Addit. Manuf. 14 (2017) 39–48. https://doi.org/10.1016/j.addma.2016.12.001.
      tb[i][j] = Math.pow(hatch / w, 2) + Math.pow(layer / d, 2);
      // King et al. keyhole criterion
      // [2] W.E. King, H.D. Barth, V.M. Castillo, G.F. Gallegos, J.W. Gibbs, D.E. Hahn, C. Kamath, A.M. Rubenchik, Observation of keyhole-mode laser melting in laser powder-bed fusion additive manufacturing, J. Mater. Process. Technol. 214 (2014) 2915–2925. https://doi.org/10.1016/j.jmatprotec.2014.06.005.
      king[i][j] = q / (hs * Math.sqrt(Math.PI * d_l * v * Math.pow(sigma, 3))) / 1000;

      if (tb[i][j] <= 1 && king[i][j] < 30) {
        mapData[i][j] = 0;
      } else if (tb[i][j] > 1) {
        mapData[i][j] = 1;
      } else if (king[i][j] > 30) {
        mapData[i][j] = 2;
      } else {
        mapData[i][j] = 0;
      }
    }
  }

  // Prepare data for Plotly (scale velocity by 1e3 for mm/s)
  const x = velocity.map(v => v * 1e3);
  const y = power;

  const data = [{
    z: mapData,
    x: x,
    y: y,
    type: 'contour',
    colorscale: [
      [0.0, 'rgb(0,255,0)'],
      [0.33, 'rgb(0,255,0)'],
      [0.33, 'rgb(255,0,0)'],
      [0.66, 'rgb(255,0,0)'],
      [0.66, 'rgb(0,0,255)'],
      [1.0, 'rgb(0,0,255)']
    ],
    contours: {
      coloring: 'fill',
      showlines: false
    },
    showscale: false
  }];

  const layout = {
    // title: 'L-PBF Process Map',
    xaxis: { title: 'Velocity [mm/s]' },
    yaxis: { title: 'Power [W]' }
  };

  Plotly.newPlot('plotlyDiv', data, layout);
}


  drawLPBFProcessMap();
  