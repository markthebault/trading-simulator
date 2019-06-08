import React from "react";
import { render } from "react-dom";
import TopToolBar from "./TopToolBar";
import Orders from "./Orders";
import ChartComponent from "./Chart";
import { getData } from "./utils";
import { TypeChooser } from "react-stockcharts/lib/helper";
import { InteractiveYCoordinate } from "react-stockcharts/lib/interactive";
import shortid from "shortid";
import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';

const sell = {
  ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
  stroke: "white",
  textFill: "white",
  bgFill: "red",
  text: "1 Sell STP",
  edge: {
    ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
    stroke: "white",
    textFill: "white",
    fill: "red"
  }
};
const buy = {
  ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
  stroke: "white",
  bgFill: "#32CD32",
  textFill: "black",
  text: "1 Sell LMT",
  edge: {
    ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
    stroke: "white",
    fill: "#32CD32"
  }
};
const open = {
  ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
  stroke: "white",
  textFill: "32CD32",
  text: "1 (0.00)",
  bgFill: "transparent",
  textBox: {
    height: 24,
    left: 20,
    padding: { left: 10, right: 5 },
    closeIcon: {
      padding: { left: 0, right: 0 },
      width: 0
    }
  },
  edge: {
    ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
    stroke: "white"
  }
};

class RootComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      orderChartItems: [],
      capital: 10000,
      tickSize: 0.25,
      tickValue: 12.5,
      currentPrice: undefined,
      chartHeight: this.getWindowHeight()-100
    };
  }

  createOrder(id, type, size, open, stoploss, takeprofit, profitloss) {
    return { id, type, size, open, stoploss, takeprofit, profitloss };
  }

  addOrderChartItems(order, orderChartItems) {
    if (orderChartItems.length === 0) {
      let openOrder = {
        ...open,
        yValue: order.open,
        id: shortid.generate(),
        draggable: false
      };
      orderChartItems.push(openOrder);
    }

    if (order.type === "Long") {
      let takeProfit = {
        ...buy,
        yValue: order.takeprofit,
        id: shortid.generate(),
        draggable: true,
        order: order
      };
      let stopLoss = {
        ...sell,
        yValue: order.stoploss,
        id: shortid.generate(),
        draggable: true,
        order: order
      };
      order.chartTakeProfit = takeProfit;
      order.chartStoploss = stopLoss;
      orderChartItems.push(takeProfit);
      orderChartItems.push(stopLoss);
    } else {
      let takeProfit = {
        ...sell,
        yValue: order.takeprofit,
        id: shortid.generate(),
        draggable: true,
        order: order,
        text: "1 Buy STP"
      };
      let stopLoss = {
        ...buy,
        yValue: order.stoploss,
        id: shortid.generate(),
        draggable: true,
        order: order,
        text: "1 Buy LMT"
      };
      order.chartTakeProfit = takeProfit;
      order.chartStoploss = stopLoss;
      orderChartItems.push(takeProfit);
      orderChartItems.push(stopLoss);
    }
  }

  removeOrderChartItems(order, orderChartItems) {
    let items = [];
    for (let i = 0; i < orderChartItems.length; ++i) {
      if (orderChartItems[i].order !== order) {
        items.push(orderChartItems[i]);
      }
    }
    return items;
  }

  onBuyOrder() {
    if (!this.state.currentPrice) return;
    let now = new Date().getTime();
    var newOrder = this.createOrder(
      now,
      "Long",
      1,
      this.state.currentPrice.close,
      this.state.currentPrice.close - 4,
      this.state.currentPrice.close + 4,
      0
    );
    let newOrders = this.state.orders.slice();
    newOrders.push(newOrder);
    this.setState({ orders: newOrders });

    let orderChartItems = this.state.orderChartItems.slice();
    this.addOrderChartItems(newOrder, orderChartItems);
    this.updateOpenPosition(newOrders, orderChartItems);
    this.setState({ orderChartItems: orderChartItems });
  }

  onSellOrder() {
    if (!this.state.currentPrice) return;
    let now = new Date().getTime();
    var newOrder = this.createOrder(
      now,
      "Short",
      1,
      this.state.currentPrice.close,
      this.state.currentPrice.close + 4,
      this.state.currentPrice.close - 4,
      0
    );
    let newOrders = this.state.orders.slice();
    newOrders.push(newOrder);
    this.setState({ orders: newOrders });

    let orderChartItems = this.state.orderChartItems.slice();
    this.addOrderChartItems(newOrder, orderChartItems);
    this.updateOpenPosition(newOrders, orderChartItems);
    this.setState({ orderChartItems: orderChartItems });
  }

  onCloseOrder(order) {
    this.setState({ capital: this.state.capital + order.profitloss });
    let newOrders = this.state.orders.slice();
    let index = newOrders.indexOf(order);
    if (index >= 0) {
      newOrders.splice(index, 1);
      this.setState({ orders: newOrders });
    }
    if (newOrders.length === 0) {
      this.setState({ orderChartItems: [] });
      return;
    }
    let orderChartItems = this.removeOrderChartItems(
      order,
      this.state.orderChartItems
    );
    this.updateOpenPosition(newOrders, orderChartItems);
    this.setState({ orderChartItems: orderChartItems });
  }

  onOrderChanged(order) {
    order.chartTakeProfit.yValue = order.takeprofit;
    order.chartStoploss.yValue = order.stoploss;
    let newOrders = this.state.orders.slice();
    this.setState({
      orders: newOrders
    });
  }

  calculateProfit(order, price) {
    if (order.type === "Long") {
      return (
        ((price - order.open) / this.state.tickSize) * this.state.tickValue
      );
    } else {
      return (
        ((order.open - price) / this.state.tickSize) * this.state.tickValue
      );
    }
  }

  closeOrdersTPorSL(price) {
    if (this.state.orders.length == 0) {
      return;
    }

    let ordersToClose = [];
    for (let i = 0; i < this.state.orders.length; ++i) {
      let order = this.state.orders[i];
      if (order.type === "Long") {
        if (price.low <= order.stoploss) {
          // stoploss hit, close order
          order.profitloss = this.calculateProfit(order, order.stoploss);
          ordersToClose.push(order);
        } else if (price.high >= order.takeprofit) {
          // takeprofit hit, close order
          order.profitloss = this.calculateProfit(order, order.takeprofit);
          ordersToClose.push(order);
        }
        order.profitloss = this.calculateProfit(order, price.close);
      } else {
        // short
        if (price.high >= order.stoploss) {
          // stoploss hit, close order
          order.profitloss = this.calculateProfit(order, order.stoploss);
          ordersToClose.push(order);
        } else if (price.low <= order.takeprofit) {
          // takeprofit hit, close order
          order.profitloss = this.calculateProfit(order, order.takeprofit);
          ordersToClose.push(order);
        }
        order.profitloss = this.calculateProfit(order, price.close);
      }
    }
    
    if (ordersToClose.length) {
      for (let i = 0; i < ordersToClose.length; ++i) {
        this.onCloseOrder(ordersToClose[i]);
      }
    }
    let newOrders = this.state.orders.slice();
    var chartItems = this.state.orderChartItems.slice();
    this.updateOpenPosition(newOrders, chartItems);
    this.setState({
      orders: newOrders,
      orderChartItems: chartItems
    });
  }

  onPriceChanged(price) {
    this.setState({ currentPrice: price });
    this.closeOrdersTPorSL(price);
  }

  updateOpenPosition(orders, orderChartItems) {
    if (orders.length <= 0 || orderChartItems.length <= 0) {
      return;
    }
    let averagePrice = 0;
    let totalProfitLoss = 0;

    for (let i = 0; i < orders.length; ++i) {
      averagePrice += orders[i].open;
      totalProfitLoss += orders[i].profitloss;
    }
    averagePrice /= orders.length;
    orderChartItems[0].yValue = averagePrice;
    if (totalProfitLoss >= 0) {
      orderChartItems[0].text =
        orders.length + " $" + totalProfitLoss.toFixed(2);
      orderChartItems[0].textFill = "#32CD32";
    } else {
      orderChartItems[0].text =
        orders.length + " $(" + +totalProfitLoss.toFixed(2) + ")";
      orderChartItems[0].textFill = "#FF0000";
    }
  }

  getWindowHeight(){
    let w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0];
    return w.innerHeight|| e.clientHeight|| g.clientHeight;
  }


  onSecondaryPaneSizeChange(secondaryPaneSize) {
    var height=this.getWindowHeight() - (secondaryPaneSize+70);
    var self=this;
    setTimeout(() => {
      self.setState({ chartHeight: height});
      
    }, 100);
  }

  render() {
    return (
      <div>
        <TopToolBar
          onBuy={this.onBuyOrder.bind(this)}
          onSell={this.onSellOrder.bind(this)}
          capital={this.state.capital}
        />
        <SplitterLayout vertical={true} percentage={false}  secondaryInitialSize={230}
                        onSecondaryPaneSizeChange={this.onSecondaryPaneSizeChange.bind(this)}
        >
          <ChartComponent
            orderChartItems={this.state.orderChartItems}
            onClose={this.onCloseOrder.bind(this)}
            onChanged={this.onOrderChanged.bind(this)}
            onPriceChanged={this.onPriceChanged.bind(this)}
            chartHeight={this.state.chartHeight}
          />
          <Orders
            orders={this.state.orders}
            onClose={this.onCloseOrder.bind(this)}
            onChanged={this.onOrderChanged.bind(this)}
          />
        </SplitterLayout>
      </div>
    );
  }
}

render(<RootComponent>,</RootComponent>, document.getElementById("root"));
