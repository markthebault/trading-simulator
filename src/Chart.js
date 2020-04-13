import React from "react";
import Chart from "./CandleStickChartWithUpdatingData";
import { getServerData } from "./utils";
import { TypeChooser } from "react-stockcharts/lib/helper";

class ChartComponent extends React.Component {
  componentDidMount() {
    getServerData(0).then(data => {
      this.setState({ data });
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
          />
        )}
      </TypeChooser>
    );
  }
}
export default ChartComponent;
