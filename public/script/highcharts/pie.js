var outputAmp_B = 0;
socket.on("Avg_temp", function (data) {
  if (data) {
    outputAmp_B = Number(data);
  }
});

$(document).ready(function() {
  var chart = {
    backgroundColor: [43, 40, 40, 0.71],
    type: 'spline',
    animation: Highcharts.svg, // don't animate in IE < IE 10.
    marginRight: 10,
    events: {
      load: function () {
          // set up the updating of the chart each second
          var series = this.series[0];
          setInterval(function () {
            var x = (new Date()).getTime(), // current time
            y = outputAmp_B;
            series.addPoint([x, y], true, true);
          }, 3600000);
        }
      }
    };
    var title = {
      text: '實驗室平均溫度',
      style: {
        color: '#ffffff'
      }
    };
    var xAxis = {
      type: 'datetime',
      tickPixelInterval: 150,
      labels:{
        style:{
          color: '#ffffff',
          fontSize: "12px",
          fontWeight: "blod",
          fontFamily: "Courier new"
        }
      }
    };
    var yAxis = {
      tickInterval: 0.01,
      title: {
        text: '平均溫度(C)',
        style:{
          color: '#ffffff'
        }
      },
      labels:{
        style:{
          color: '#ffffff',
          fontSize: "12px",
          fontWeight: "blod",
          fontFamily: "Courier new"
        }
      },
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
      }]
    };
    var tooltip = {
      formatter: function () {
        return '<b>' + this.series.name + '</b><br/>' +
        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
        Highcharts.numberFormat(this.y, 2);
      }
    };
    var plotOptions = {
      area: {
        pointStart: 1940,
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2,
          states: {
            hover: {
              enabled: true
            }
          }
        }
      }
    };
    var legend = {
      enabled: false
    };
    var exporting = {
      enabled: false
    };
    var series= [{
      name: 'Avg_temp',
      data: (function () {
        // generate an array of random data
        var data = [],time = (new Date()).getTime(),i;
        for (i = -23; i <= 0; i += 1) {
          data.push({
            x: time + i * 3600000,
            y: Math.random() * 3+22
          });
        }
        return data;
      }())
    }];

    var credits = {
      enabled: false
    }

    var json = {};
    json.chart = chart;
    json.title = title;
    json.tooltip = tooltip;
    json.xAxis = xAxis;
    json.yAxis = yAxis;
    json.legend = legend;
    json.exporting = exporting;
    json.series = series;
    json.plotOptions = plotOptions;
    json.credits = credits;


    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });
    $('#pie').highcharts(json);
});

