const koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const serve = require('koa-static');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const render = require('koa-swig');
const co = require('co');
const mqtt = require('mqtt');
const http = require('http');
const socket = require('socket.io');
const dotenv = require('dotenv').load();
const request = require('request-promise');
const MongoClient = require('mongodb').MongoClient;
const MongoDB = require('./lib/mongoDB.js');
const { time } = require('console');

const app = new koa();
const router = Router();
const server = http.createServer(app.callback());
const io = socket(server);

let piePercent = [
    { name: '冷氣', y: 100 },
    { name: 'UPS1', y: 100 },
    { name: 'UPS2', y: 100 }
]; 
//ET7044 status
let et7044Status, D0, D1, D2;
var Avg_temp = [] ;  
var time_array = []
MongoClient.connect(process.env.MONGODB, (err, client) => {
    console.log(err)
    let db = client.db("rpi_left");
    let db2 = client.db("rpi_right");
    let Storage_db = client.db("Storage_data")
    mongodb = new MongoDB(db);
    mognodb_right = new MongoDB(db2)
    Storage_data = new MongoDB(Storage_db)
    new Promise(function (resolve, reject) {
        resolve(mongodb.LeftAverageData());
    }).then(function (value) {
        io.emit('Avg_temp_left', Math.round(value[2]*100)/100);
        io.emit('Avg_humid_left', Math.round(value[1]*100)/100);
        io.emit('Avg_CO2_left', Math.round(value[0]*100)/100);
        console.log(new Date() + JSON.stringify(value));
        console.log(value)
    });
    new Promise(function (resolve, reject) {
        resolve(mognodb_right.RightAverageData());
    }).then(function (value) {
        io.emit('Avg_temp_right', Math.round(value[2]*100)/100);
        io.emit('Avg_humid_right', Math.round(value[1]*100)/100);
        io.emit('Avg_CO2_right', Math.round(value[0]*100)/100);
        console.log(new Date() + JSON.stringify(value));
        console.log(value)
    });
    new Promise(function (resolve, reject) {
        resolve(Storage_data.StorageAverageData());
    }).then(function (value) {
        io.emit('Storage_Avg_temp', Math.round(value[2]*100)/100);
        io.emit('Storage_Avg_humid', Math.round(value[1]*100)/100);
        io.emit('Storage_Avg_CO2', Math.round(value[0]*100)/100);
        console.log(new Date() + JSON.stringify(value));
        console.log(value)
    });
});

const mqttClient = mqtt.connect(process.env.MQTT);

mqttClient.on('connect', () => {
    mqttClient.subscribe('humid_left');
    mqttClient.subscribe('tempareture_left');
    mqttClient.subscribe('CO2_left');
    mqttClient.subscribe('TVOC_left'); 
    mqttClient.subscribe('humid_right');
    mqttClient.subscribe('tempareture_right');
    mqttClient.subscribe('CO2_right');
    mqttClient.subscribe('TVOC_right'); 
    mqttClient.subscribe('7F_FAN')
    mqttClient.subscribe('7F_FAN_2')
    mqttClient.subscribe('Storage')
});

mqttClient.on('message', (topic, message) => {
    // console.log(topic,JSON.parse(message));
    switch (topic) {
        //power-meter MQTT input data
        case 'humid_left':
            // console.log(message.toString());
            io.emit('humid_left', message.toString());
            break;
        case 'tempareture_left':
            io.emit('tempareture_left', message.toString());
            break;
        case 'CO2_left':
            // console.log(message.toString());
            io.emit('CO2_left', message.toString());
            break;
        case 'TVOC_left':
            // console.log(message.toString());
            io.emit('TVOC_left', message.toString());
            break;
        case 'humid_right':
            // console.log(message.toString());
            io.emit('humid_right', message.toString());
            break;
        case 'tempareture_right':
            io.emit('tempareture_right', message.toString());
            break;
        case 'CO2_right':
            // console.log(message.toString());
            io.emit('CO2_right', message.toString());
            break;
        case 'TVOC_right':
            // console.log(message.toString());
            io.emit('TVOC_right', message.toString());
            break;
        case '7F_FAN':
            // fanStatus = message
            fanStatus = JSON.parse(message);
            console.log(fanStatus);
            io.emit('fan1', fanStatus[0]);
            io.emit('fan2', fanStatus[1]);
            break;
        case '7F_FAN_2':
            fanStatus2 = JSON.parse(message);
            console.log(fanStatus2);
            io.emit('fan3', fanStatus2[0]);
            io.emit('fan4', fanStatus2[1]);
            break;
        case 'Storage':
            Storage_status = JSON.parse(message)
            console.log(Storage_status)
            io.emit('Storage_CO2',Storage_status[0])
            io.emit('Storage_TVOC',Storage_status[1])
            io.emit('Storage_humid',Storage_status[2])
            io.emit('Storage_tempareture',Storage_status[3])
            break;
        default:
            console.log('pass');
    }
});

//更新圓餅圖
setInterval(() => {
    new Promise(function (resolve, reject) {
        resolve(mongodb.LeftAverageData());
    }).then(function (value) {
        io.emit('Avg_temp_left', Math.round(value[2]*100)/100);
        io.emit('Avg_humid_left', Math.round(value[1]*100)/100);
        io.emit('Avg_CO2_left', Math.round(value[0]*100)/100);
        console.log(new Date() + JSON.stringify(value));
        console.log(value)
    });
    new Promise(function (resolve, reject) {
        resolve(mognodb_right.RightAverageData());
    }).then(function (value) {
        io.emit('Avg_temp_right', Math.round(value[2]*100)/100);
        io.emit('Avg_humid_right', Math.round(value[1]*100)/100);
        io.emit('Avg_CO2_right', Math.round(value[0]*100)/100);
        console.log(new Date() + JSON.stringify(value));
        console.log(value)
    });
    new Promise(function (resolve, reject) {
        resolve(Storage_data.StorageAverageData());
    }).then(function (value) {
        io.emit('Storage_Avg_temp', Math.round(value[2]*100)/100);
        io.emit('Storage_Avg_humid', Math.round(value[1]*100)/100);
        io.emit('Storage_Avg_CO2', Math.round(value[0]*100)/100);
        console.log(new Date() + JSON.stringify(value));
        console.log(value)
    });
}, 2000);

// setInterval(() => {
//   mongodb.yesterdayAvgPowerRobot();
// },10000);

app.use(json());
app.use(logger());
app.use(bodyParser());
app.use(serve(__dirname + '/public/img'));
app.use(serve(__dirname + '/public/css'));
app.use(serve(__dirname + '/public/script'));
app.use(serve(__dirname + '/lib'));
app.use(router.routes());

app.context.render = co.wrap(render({
    root: __dirname + '/public/views',
    autoescape: true,
    cache: 'memory',
    ext: 'html',
}));

router.get('/', index);
router.post('/7F_left_fan', SevenFloor_left_fan);
router.post('/7F_right_fan', SevenFloor_right_fan);
async function index(ctx) {
    ctx.body = await ctx.render('smart', {
        "powerMeterPower": Avg_temp,
        "timedata" : time_array,
        // "upsPower_A": 123,
        // "upsPower_B": 123
    });
}
// "powerMeterPower": piePercent[0].y,
// "upsPower_A": piePercent[1].y,
// "upsPower_B": piePercent[2].y

async function SevenFloor_left_fan(ctx) {
    let fan_control = ctx.request.body.data;
    switch (fan_control){
        case 'fan1':
            if(fanStatus[0] != '抽風' && fanStatus[0] != '進風'){
                mqttClient.publish('arduino', '1');
            }
            if(fanStatus[0] != '關閉' && fanStatus[0] != '進風'){
                mqttClient.publish('arduino', '2');
            }
            if(fanStatus[0] != '抽風' && fanStatus[0] != '關閉'){
                mqttClient.publish('arduino', 'a');
            }

            break;
        case 'fan2':
            if(fanStatus[1] != '抽風' && fanStatus[1] != '進風'){
                mqttClient.publish('arduino', '3');
            }
            if(fanStatus[1] != '關閉' && fanStatus[1] != '進風'){
                mqttClient.publish('arduino', '4');
            }
            if(fanStatus[1] != '抽風' && fanStatus[1] != '關閉'){
                mqttClient.publish('arduino', 'b');
            }

            break;
    }
}
async function SevenFloor_right_fan(ctx) {
    let fan_control = ctx.request.body.data;
    switch (fan_control){
        case 'fan3':
            if(fanStatus2[0] != '抽風' && fanStatus2[0] != '進風'){
                mqttClient.publish('arduino', '5');
            }
            if(fanStatus2[0] != '關閉' && fanStatus2[0] != '進風'){
                mqttClient.publish('arduino', '6');
            }
            if(fanStatus2[0] != '抽風' && fanStatus2[0] != '關閉'){
                mqttClient.publish('arduino', 'c');
            }
            break;
        case 'fan4':
            if(fanStatus2[1] != '抽風' && fanStatus2[1] != '進風'){
                mqttClient.publish('arduino', '7');
            }
            if(fanStatus2[1] != '關閉' && fanStatus2[1] != '進風'){
                mqttClient.publish('arduino', '8');
            }
            if(fanStatus2[1] != '抽風' && fanStatus2[1] != '關閉'){
                mqttClient.publish('arduino', 'd');
            }
            break;
    }
}
server.listen(process.env.PORT, function () {
    let port = server.address().port;
    console.log("App now running on port", port);
});

