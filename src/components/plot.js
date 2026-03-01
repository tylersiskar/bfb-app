import Plotly from "plotly.js/lib/core";
import scatter from "plotly.js/lib/scatter";
import box from "plotly.js/lib/box";
import createPlotlyComponent from "react-plotly.js/factory";

Plotly.register([scatter, box]);

export default createPlotlyComponent(Plotly);
