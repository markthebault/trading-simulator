import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import SelectDateDialog from "./SelectDateDialog";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

class TopToolBar extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      openDialog:false
    };
    this.classes = makeStyles(theme => ({
      root: {
        flexGrow: 1,
        color: 'white'
      },
      menuButton: {
        marginRight: theme.spacing(2)
      },
      title: {
        flexGrow: 1
      },
    }));
  }
  
  onCloseDialog(date){
    this.setState({
      openDialog:false
    });
    this.props.onGotoDate(date);
  }
  
  onCancelDialog(){
    this.setState({
      openDialog:false
    });
  }

  onOpenDialog(){
    this.setState({
      openDialog:true
    });
  }

  render() {
    return (
      <div className={this.classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              className={this.classes.menuButton}
              color="inherit"
              aria-label="Menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={this.classes.title}>
              Trading Simulator&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

              <Select id="select" value={this.props.ticker} onChange={this.props.onChangeTicker}>
              <MenuItem value="AAPL">AAPL</MenuItem>
                <MenuItem value="BABA">BABA</MenuItem>
                <MenuItem value="EBAY">EBAY</MenuItem>
                <MenuItem value="INTC">INTC</MenuItem>
                <MenuItem value="KO">KO</MenuItem>
                <MenuItem value="MSFT">MSFT</MenuItem>
                <MenuItem value="PEP">PEP</MenuItem>
                <MenuItem value="SQ">SQ</MenuItem>
                <MenuItem value="ADBE">ADBE</MenuItem>
                <MenuItem value="CSCO">CSCO</MenuItem>
                <MenuItem value="EXPE">EXPE</MenuItem>
                <MenuItem value="GM">GM</MenuItem>
                <MenuItem value="JNJ">JNJ</MenuItem>
                <MenuItem value="MA">MA</MenuItem>
                <MenuItem value="MU">MU</MenuItem>
                <MenuItem value="PYPL">PYPL</MenuItem>
                <MenuItem value="TWTR">TWTR</MenuItem>
                <MenuItem value="AMD">AMD</MenuItem>
                <MenuItem value="CVX">CVX</MenuItem>
                <MenuItem value="FB">FB</MenuItem>
                <MenuItem value="GS">GS</MenuItem>
                <MenuItem value="JNPR">JNPR</MenuItem>
                <MenuItem value="MCD">MCD</MenuItem>
                <MenuItem value="NKE">NKE</MenuItem>
                <MenuItem value="QCOM">QCOM</MenuItem>
                <MenuItem value="SBUX">SBUX</MenuItem>
                <MenuItem value="ATVI">ATVI</MenuItem>
                <MenuItem value="EA">EA</MenuItem>
                <MenuItem value="FDX">FDX</MenuItem>
                <MenuItem value="IBM">IBM</MenuItem>
                <MenuItem value="JPM">JPM</MenuItem>
                <MenuItem value="MOMO">MOMO</MenuItem>
                <MenuItem value="NVDA">NVDA</MenuItem>
                <MenuItem value="QQQ">QQQ</MenuItem>
                <MenuItem value="SPY">SPY</MenuItem>
              </Select>
              <Select id="ticker" value={this.props.timeframe} onChange={this.props.onChangeTf}>
                <MenuItem value="1min" >1 Minute</MenuItem>
                <MenuItem value="2min">2 Minutes</MenuItem>
                <MenuItem value="15min">15 Minutes</MenuItem>
                <MenuItem value="60min">60 Minutes</MenuItem>
              </Select>

              <Select id="size" value={this.props.size} onChange={this.props.onChangeSize}>
                <MenuItem value="50" >Size: 50</MenuItem>
                <MenuItem value="100">Size: 100</MenuItem>
                <MenuItem value="200">Size: 200</MenuItem>
                <MenuItem value="300">Size: 300</MenuItem>
                <MenuItem value="500">Size: 500</MenuItem>
              </Select>
              <Button variant="outlined" color="inherit" onClick={this.props.onBuyMarket}>
                Buy MKT
              </Button>&nbsp;&nbsp;
              <Button variant="outlined" color="inherit" onClick={this.props.onSellMarket}>
                Sell MKT
              </Button>&nbsp;&nbsp;
              <Button variant="outlined" color="inherit" onClick={this.props.onBuyLimit}>
                Buy Lmt
              </Button>&nbsp;&nbsp;
              <Button variant="outlined" color="inherit" onClick={this.props.onSellLimit}>
                Sell Lmt
              </Button>&nbsp;&nbsp;
              <Button variant="outlined" color="inherit" onClick={this.onOpenDialog.bind(this)}>
                Goto...
              </Button>&nbsp;&nbsp;
            </Typography>
            <Typography>Capital: $ {this.props.capital.toFixed(2)}&nbsp; ({this.props.percentage.toFixed(2)}%) </Typography>
          </Toolbar>
        </AppBar>
        <SelectDateDialog onCancel={this.onCancelDialog.bind(this)} onClose={this.onCloseDialog.bind(this)} open={this.state.openDialog}></SelectDateDialog>
      </div>
    );
  }
}

TopToolBar.propTypes = {
  onBuyMarket: PropTypes.func,
  onSellMarket: PropTypes.func,
  onBuyLimit: PropTypes.func,
  onSellLimit: PropTypes.func,
  onGotoDate: PropTypes.func,
  onChangeTicker: PropTypes.func,
  onChangeTf: PropTypes.func,
  onChangeSize: PropTypes.func,
  capital: PropTypes.number,
  percentage:PropTypes.number
};

export default TopToolBar;
