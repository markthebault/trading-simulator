import { tsvParse, csvParse } from "d3-dsv";
import { timeParse } from "d3-time-format";



function parseData(parse) {
  return function(d) {
    d.date = parse(d.time);
    d.open = +d.open;
    d.high = +d.high;
    d.low = +d.low;
    d.close = +d.close;
    d.volume = 10*d.volume;
    
    // console.log(d)
    return d;
  };
}

function prepareServerData(d){
  let data = []
  d.forEach(line => {
    data.push({
      date : new Date(line.Time * 1000),
      open : line.Open,
      high : line.High,
      low : line.Low,
      close : line.Close,
      mm20: line.mm20,
      mm200: line.mm200,
      volume :10*line.Volume
    });
  });

  //Add some offset to the data
  let max = 0
  d.forEach(line => {
    max = line.Time > max ? line.Time : max
  });
  for(let i=1; i<=10;i++){
    data.push({
      date: new Date( (max +i*2*60) * 1000 )
    })
  }

  return data;
}

const parseDate = timeParse("%Y%m%d %H:%M:%S");

export function getServerData(ticker, date, position) {
  const promiseMSFT = fetch(
    // "https://raw.githubusercontent.com/markthebault/trading-simulator/master/data/aapl-small.csv"
    "http://localhost:8080/bars?ticker="+ticker+"&day="+date+"&bar_id="+position+"&length=550"
  )
    .then(response => response.text())
    // .then(data => csvParse(data, parseData(parseDate)))
    .then(data => JSON.parse(data))
    .then(data => data["2min"])
    .then(data => prepareServerData(data));
    // .then(data => {console.log(data); return data });
  return promiseMSFT;
}
