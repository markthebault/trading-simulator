import React from "react";
import Chart from "./CandleStickChartWithUpdatingData";
import { getServerData, GRAPH_OFSET } from "./utils";
import { TypeChooser } from "react-stockcharts/lib/helper";

class ChartComponent extends React.Component {
  componentDidMount() {
    getServerData(this.props.ticker, this.props.tf, this.props.startDate, 0).then(data => {
      let currentPrice=data[data.length -1 - GRAPH_OFSET].close;

      this.setState({ 
        data: data,
        currentPrice: currentPrice

       });

    });
  }
  render() {
    if (this.state == null) {
      return <div>Loading...</div>;
    }
    return (
      <TypeChooser>
        {type => (
          <Chart
            orderChartItems={this.props.orderChartItems}
            onClose={this.props.onClose}
            onChanged={this.props.onChanged}
            onPriceChanged={this.props.onPriceChanged}
            type={type}
            data={this.state.data}
            chartHeight={this.props.chartHeight}
            startDate={this.props.startDate}
            ticker={this.props.ticker}
            tf={this.props.tf}
          />
        )}
      </TypeChooser>
    );
  }
}
export default ChartComponent;
