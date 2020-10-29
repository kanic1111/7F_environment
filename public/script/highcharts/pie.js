// var piePercent = [
//     { name: '冷氣', y: parseInt("{{powerMeterPower}}") },
//     { name: 'UPS1', y: parseInt("{{upsPower_A}}") },
//     { name: 'UPS2', y: parseInt("{{upsPower_B}}") }
// ];

// console.log(piePercent[0].split(',').map(x=>+x));
// var test = piePercent[0].split(',')
console.log(piePercent)
socket.on("piePercent", function (data) {
  if (data) {
    piePercent = data;
    console.log(piePercent);
    
    new Highcharts.chart('container', {
        chart: {
            backgroundColor: [43, 40, 40, 0.71],
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'line'
        },
        title: {
            style: {
              color:"#ffffff"
            },
            verticalAlign: 'top',
            y:6,
            text: '實驗室平均溫度'
        },
        xAxis: {
            categories: time_array
        },
        yAxis: {
            title: {
                text: 'Temperature (°C)'
            }
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                colors: pieColors,
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                    distance: -46,
                    filter: {
                        property: 'percentage',
                        operator: '>',
                        value: 4
                    },
                    style: {
                        fontSize: '16px'
                    }
                }
            }
        },
        series: [{
            name: time_array,
            data: piePercent[0].split(',').map(x=>+x),
        }],
        navigation:{
          buttonOptions: {
            enabled:false
          }
        },
        credits: {
          enabled: false
        }
    });
  }
});

// Make monochrome colors
var pieColors = (function () {
    var colors = [],
        base = Highcharts.getOptions().colors[0],
        i;

    for (i = 0; i < 10; i += 1) {
        // Start out with a darkened base color (negative brighten), and end
        // up with a much brighter color
        colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
    }
    return colors;
}());
var time_array = []
time_array.push(new Date().getHours()+":00:00")
setInterval(() => {
    if(time_array.length = 24){
        time_array.shift(); 
        time_array.push(new Date().getHours()+":00:00")
        }
        else{
        time_array.push(new Date().getHours()+":00:00")
        }
}, 3600000);
console.log(time_array)
// Build the chart
Highcharts.chart('container', {
    chart: {
        backgroundColor: [43, 40, 40, 0.71],
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'line'
    },
    title: {
        style: {
          color:"#ffffff"
        },
        verticalAlign: 'top',
        y:6,
        text: '實驗室平均溫度'
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    xAxis: {
        categories: time_array
    },
    yAxis: {
        title: {
            text: 'Temperature (°C)'
        }
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            colors: pieColors,
            dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                distance: -46,
                filter: {
                    property: 'percentage',
                    operator: '>',
                    value: 4
                },
                style: {
                    fontSize: '16px'
                }
            }
        }
    },
    
    series: [{
        name: time_array,
        data: piePercent[0].split(',').map(x=>+x),
    }],
    navigation:{
      buttonOptions: {
        enabled:false
      }
    },
    credits: {
      enabled: false
    }
});
