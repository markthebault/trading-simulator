export const GRAPH_OFSET=10

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
  for(let i=1; i<=GRAPH_OFSET;i++){
    data.push({
      date: new Date( (max +i*2*60) * 1000 )
    })
  }

  return data;
}


export function getServerData(ticker, tf, date, position) {
  const promiseMSFT = fetch(
    // "https://raw.githubusercontent.com/markthebault/trading-simulator/master/data/aapl-small.csv"
    "/bars?ticker="+ticker+"&day="+date+"&bar_id="+position+"&length=450"
  )
    .then(response => response.text())
    // .then(data => csvParse(data, parseData(parseDate)))
    .then(data => JSON.parse(data))
    .then(data => data[tf])
    .then(data => prepareServerData(data));
    // .then(data => {console.log(data); return data });
  return promiseMSFT;
}
