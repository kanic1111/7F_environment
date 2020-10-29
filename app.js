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
var time_array = [];
MongoClient.connect(process.env.MONGODB, (err, client) => {
    console.log(err)
    let db = client.db("data_test");
    mongodb = new MongoDB(db);
    new Promise(function (resolve, reject) {
        resolve(mongodb.aggregateAvgPieData());
    }).then(function (value) {
        Avg_temp.push(JSON.stringify(value))
        time_array.push(new Date().getHours()+":00:00")
        io.emit('piePercent', Avg_temp);
        io.emit('time',time_array);
        console.log(new Date() + JSON.stringify(value));
        console.log(Avg_temp)
        console.log(time_array)
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
            io.emit('TVOC', message.toString());
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
        default:
            console.log('pass');
    }
});

//更新圓餅圖
setInterval(() => {
    new Promise(function (resolve, reject) {
        resolve(mongodb.aggregateAvgPieData());
    }).then(function (value) {
        console.log(new Date() + JSON.stringify(value));
        if(Avg_temp.length = 24){
            Avg_temp.shift(); 
            Avg_temp.push(JSON.stringify(value))
        }
        else{
        Avg_temp.push(JSON.stringify(value))
        }
        io.emit('piePercent', Avg_temp);
    });
}, 3600000);

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
router.post('/ET7044', et7044);
router.post('/7F_left_fan', SevenFloor_left_fan);
router.post('/7F_right_fan', SevenFloor_right_fan);
router.post('/yesterdayAvgPower', yesterdayAvgPower);
router.post('/cameraPower', cameraPower);

async function index(ctx) {
    ctx.body = await ctx.render('smart', {
        "powerMeterPower": Avg_temp,
        // "upsPower_A": 123,
        // "upsPower_B": 123
    });
}
// "powerMeterPower": piePercent[0].y,
// "upsPower_A": piePercent[1].y,
// "upsPower_B": piePercent[2].y

async function et7044(ctx) {
    let et7044 = ctx.request.body.data;
    switch (et7044) {
        case 'D0':
            et7044Status[0] = !et7044Status[0];
            mqttClient.publish('ET7044/write', JSON.stringify(et7044Status));
            break;
        case 'D1':
            et7044Status[1] = !et7044Status[1];
            mqttClient.publish('ET7044/write', JSON.stringify(et7044Status));
            break;
        case 'D2':
            et7044Status[2] = !et7044Status[2];
            mqttClient.publish('ET7044/write', JSON.stringify(et7044Status));
            break;
        default:
            console.log('pass');
            break;
    }
    console.log(et7044);
    ctx.body = et7044;
}
async function SevenFloor_left_fan(ctx) {
    let fan_control = ctx.request.body.data;
    switch (fan_control){
        case 'fan1':
            if(fanStatus[0] != '正轉' && fanStatus[0] != '反轉'){
                mqttClient.publish('arduino', '1');
            }
            if(fanStatus[0] != '關閉' && fanStatus[0] != '反轉'){
                mqttClient.publish('arduino', '2');
            }
            if(fanStatus[0] != '正轉' && fanStatus[0] != '關閉'){
                mqttClient.publish('arduino', 'a');
            }
            break;
        case 'fan2':
            if(fanStatus[1] != '正轉' && fanStatus[1] != '反轉'){
                mqttClient.publish('arduino', '3');
            }
            if(fanStatus[1] != '關閉' && fanStatus[1] != '反轉'){
                mqttClient.publish('arduino', '4');
            }
            if(fanStatus[1] != '正轉' && fanStatus[1] != '關閉'){
                mqttClient.publish('arduino', 'b');
            }
            break;
    }
}
async function SevenFloor_right_fan(ctx) {
    let fan_control = ctx.request.body.data;
    switch (fan_control){
        case 'fan3':
            if(fanStatus2[0] != '正轉' && fanStatus2[0] != '反轉'){
                mqttClient.publish('arduino', '5');
            }
            if(fanStatus2[0] != '關閉' && fanStatus2[0] != '反轉'){
                mqttClient.publish('arduino', '6');
            }
            if(fanStatus2[0] != '正轉' && fanStatus2[0] != '關閉'){
                mqttClient.publish('arduino', 'c');
            }
            break;
        case 'fan4':
            if(fanStatus2[1] != '正轉' && fanStatus2[1] != '反轉'){
                mqttClient.publish('arduino', '7');
            }
            if(fanStatus2[1] != '關閉' && fanStatus2[1] != '反轉'){
                mqttClient.publish('arduino', '8');
            }
            if(fanStatus2[1] != '正轉' && fanStatus2[1] != '關閉'){
                mqttClient.publish('arduino', 'd');
            }
            break;
    }
}
async function yesterdayAvgPower(ctx) {
    let yesterdayPower = ctx.request.body;
    io.emit('yesterdayPower', yesterdayPower);
    ctx.body = 'ok';
}

async function cameraPower(ctx){
    let cameraPowerData = ctx.request.body.cameraPower;
    await mongodb.insertCameraPower(cameraPowerData);
    ctx.body = 'ok';
}

server.listen(process.env.PORT, function () {
    let port = server.address().port;
    console.log("App now running on port", port);
});
