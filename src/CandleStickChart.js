import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";

import { ChartCanvas, Chart, ZoomButtons } from "react-stockcharts";
import {
  BarSeries,
  CandlestickSeries,
  LineSeries
} from "react-stockcharts/lib/series";
import { YAxis } from "react-stockcharts/lib/axes";
import {
  CrossHairCursor,
  CurrentCoordinate,
  EdgeIndicator,
  MouseCoordinateY
} from "react-stockcharts/lib/coordinates";

import { saveInteractiveNodes, getInteractiveNodes } from "./interactiveutils";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { sma } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { InteractiveYCoordinate } from "react-stockcharts/lib/interactive";
import { last } from "react-stockcharts/lib/utils";

const mouseEdgeAppearance = {
  textFill: "#542605",
  stroke: "#05233B",
  strokeOpacity: 1,
  strokeWidth: 3,
  arrowWidth: 5,
  fill: "#BCDEFA"
};

function round(number) {
  return Math.round(number / 0.25) * 0.25;
}

class CandleStickChart extends React.Component {
  constructor(props) {
    super(props);
    this.onDragComplete = this.onDragComplete.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.saveInteractiveNodes = saveInteractiveNodes.bind(this);
    this.getInteractiveNodes = getInteractiveNodes.bind(this);

    this.state = {
      enableInteractiveObject: false,
			suffix: 1
    };
  }

  onDelete(yCoordinate, moreProps) {
    this.setState(state => {
      const chartId = moreProps.chartConfig.id;
      const key = `yCoordinateList_${chartId}`;
      const list = state[key];
      return {
        [key]: list.filter(d => d.id !== yCoordinate.id)
      };
    });
  }

  onDragComplete(yCoordinateList, moreProps, draggedAlert) {
    let price = round(draggedAlert.yValue);
    let order = draggedAlert.order;
    if (draggedAlert.id === order.chartTakeProfit.id) {
      order.takeprofit = price;
      this.props.onChanged(order);
    }
    if (draggedAlert.id === order.chartStoploss.id) {
      order.stoploss = price;
      this.props.onChanged(order);
    }
    if (order.chartOpen && draggedAlert.id === order.chartOpen.id && !order.isopened) {
      order.open = price;
      this.props.onChanged(order);
    }
  }
	handleReset() {
		this.setState({
			suffix: this.state.suffix + 1
		});
	}

  render() {
    const sma20 = sma()
      .id(0)
      .options({ windowSize: 10 })
      .merge((d, c) => {
        d.sma20 = c;
      })
      .accessor(d => d.sma20);

    const sma200 = sma()
      .id(2)
      .options({ windowSize: 200 })
      .merge((d, c) => {
        d.sma200 = c;
      })
      .accessor(d => d.sma200);


    const { type, data: initialData, width, ratio } = this.props;

    const calculatedData = sma20(sma200(initialData));
    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      d => d.date
    );
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(
      calculatedData
    );

    const start = xAccessor(last(data));
		const end = xAccessor(data[Math.max(0, data.length - 120)]);
		const xExtents = [start, end];

    // const margin = { left: 70, right: 70, top: 20, bottom: 30 };
    const height = this.props.chartHeight;
    // const gridHeight = height - margin.top - margin.bottom;
    // const gridWidth = width - margin.left - margin.right;
    // const showGrid = true;
    // const yGrid = showGrid
    //   ? { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.2 }
    //   : {};
    // const xGrid = showGrid
    //   ? { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.2 }
    //   : {};

    return (
      <ChartCanvas
        height={height}
        width={width}
        ratio={ratio}
        margin={{ left: 70, right: 70, top: 20, bottom: 30 }}
        type={type}
        seriesName={`${this.state.ticker}_${this.state.suffix}`}
        data={data}
        xScale={xScale}
        xExtents={xExtents}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
      >
        <Chart
          id={2}
          yExtents={[d => d.volume]}
          height={100}
          origin={(w, h) => [0, h - 100]}
        >
          <YAxis
            axisAt="left"
            orient="left"
            ticks={5}
            // tickStroke="#FFFFFF"
            // stroke="#FFFFFF"
            tickFormat={format(".2s")}
          />

          <BarSeries
            yAccessor={d => d.volume}
            fill={d => (d.close > d.open ? "#6BA583" : "#FF0000")}
          />
        

          <CurrentCoordinate yAccessor={d => d.volume} fill="#9B0A47" />

          <EdgeIndicator
            itemType="first"
            orient="left"
            edgeAt="left"
            yAccessor={d => d.volume}
            displayFormat={format(".4s")}
            fill="#0F0F0F"
          />
          <EdgeIndicator
            itemType="last"
            orient="right"
            edgeAt="right"
            yAccessor={d => d.volume}
            displayFormat={format(".4s")}
            fill="#0F0F0F"
          />
        </Chart>
        <Chart
          id={1}
          height={height - 50}
          yPan
          yExtents={[d => [d.high, d.low], sma20.accessor(), sma200.accessor()]}
          padding={{ top: 10, bottom: 20 }}
        >
          {/* <XAxis
            axisAt="bottom"
            orient="bottom"

            opacity={0.5}
            {...xGrid}
            ticks={12}
          />
          <YAxis
            axisAt="right"
            orient="right"
            ticks={5}

            opacity={0.5}
            {...yGrid}
          /> */}
          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format(".2f")}
            {...mouseEdgeAppearance}
          />
          <CandlestickSeries />
          {/* 
          Indicators calculated by the chart
          <LineSeries
            yAccessor={sma20.accessor()}
            stroke={sma20.stroke()}
            highlightOnHover
          />
          <LineSeries
            yAccessor={sma200.accessor()}
            stroke={sma200.stroke()}
            highlightOnHover
          />
          <CurrentCoordinate
            yAccessor={sma20.accessor()}
            fill={sma20.stroke()}
          />
          <CurrentCoordinate
            yAccessor={sma200.accessor()}
            fill={sma200.stroke()}
          />
          <EdgeIndicator
            itemType="last"
            orient="right"
            edgeAt="right"
            yAccessor={sma20.accessor()}
            fill={sma20.fill()}
          />
          <EdgeIndicator
            itemType="last"
            orient="right"
            edgeAt="right"
            yAccessor={sma200.accessor()}
            fill={sma200.fill()} */}
          />


          <LineSeries
            yAccessor={d => d.mm20}
            highlightOnHover
            stroke="#4682B4"
          />


          <LineSeries
            yAccessor={d => d.mm200}
            highlightOnHover
            stroke="#FF0000"
          />

          <EdgeIndicator
            itemType="last"
            orient="right"
            edgeAt="right"
            yAccessor={d => d.close}
            fill={d => (d.close > d.open ? "#6BA583" : "#DB0000")}
          />



          <InteractiveYCoordinate
            ref={this.saveInteractiveNodes("InteractiveYCoordinate", 1)}
            enabled={this.state.enableInteractiveObject}
            onDragComplete={this.onDragComplete}
            onDelete={this.onDelete}
            yCoordinateList={this.props.orderChartItems}
          />
					<ZoomButtons
						onReset={this.handleReset.bind(this)}
					/>
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
    );
  }
}

CandleStickChart.propTypes = {
  orderChartItems: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onChanged: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  chartHeight: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]).isRequired
};

CandleStickChart.defaultProps = {
  type: "svg"
};

CandleStickChart = fitWidth(CandleStickChart);

export default CandleStickChart;
