import React from "react";
import { getServerData } from "./utils";


function getDisplayName(ChartComponent) {
  const name =
    ChartComponent.displayName || ChartComponent.name || "ChartComponent";
  return name;
}

export default function updatingDataWrapper(ChartComponent) {

  class UpdatingComponentHOC extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        offset: 0,
        data: this.props.data
      };
      this.onKeyPress = this.onKeyPress.bind(this);
    }

    componentDidUpdate(prevProps){
      if (this.props.startDate !== prevProps.startDate) {
        getServerData(this.props.ticker, this.props.startDate, 0).then(data => {
          this.setState({ 
            data: data
           });
          });
      }
    }

    componentDidMount() {
      document.addEventListener("keydown", this.onKeyPress);
    }

    componentWillUnmount() {
      if (this.interval) clearInterval(this.interval);
      document.removeEventListener("keydown", this.onKeyPress);
    }

    updateData(offset) {
      getServerData(this.props.ticker, this.props.startDate, offset).then(data =>{
        this.setState({
          offset: offset,
          data: data
        });
        this.props.onPriceChanged(this.state.currentPrice);
      });

    }

    onKeyPress(e) {
      let offset = this.state.offset
      const keyCode = e.which;
      switch (keyCode) {
        case 32:
        case 39: // Left
          offset = this.state.offset + 1
          this.updateData(offset );
          break;

        case 37: // Right
          offset = this.state.offset - 1
          if (this.state.offset > 0) {
            this.updateData(offset);
          }
          break;
        default:
          break;
      }
    }
    render() {
      const { type } = this.props;
      const { data } = this.state;

      return (
        <ChartComponent
          ref="component"
          orderChartItems={this.props.orderChartItems}
          onClose={this.props.onClose}
          onChanged={this.props.onChanged}
          data={data}
          type={type}
          chartHeight={this.props.chartHeight}
        />
      );
    }
  }
  UpdatingComponentHOC.defaultProps = {
    type: "svg"
  };
  UpdatingComponentHOC.displayName = `updatingDataWrapper(${getDisplayName(
    ChartComponent
  )})`;

  return UpdatingComponentHOC;
}
