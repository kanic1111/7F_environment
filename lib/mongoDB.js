class MongoDB {
    constructor(db) {
        this.db = db;
        this.avgPower = function (col, Start, End) {
            return new Promise(function (resolve, reject) {
                let collection = db.collection(col);
                let sumPower = 0
                collection.aggregate(
                    [
                        { $match: { "time": { "$gte": Start, "$lte": End } } },
                        {
                            $group: {
                                _id: "$name",
                                
                                avgPower: { $avg: "$data" }
                            },
                        },
                        { $sort: { _id: -1 } }
                    ], (err, data) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            console.log(data);
                            if (data.length != 0) {
                                data.map((obj) => {
                                    // 將平均功耗 * 24 hr
                                    sumPower += obj.avgPower 
                                })
                            }
                            console.log(`${col}:${sumPower}`)
                            resolve(sumPower);
                        }
                    });
            });
        }

        this.yesterdayAvgPower = function (col, Start, End) {
            return new Promise(function (resolve, reject) {
                let collection = db.collection(col);
                let sumPower = 0
                collection.aggregate(
                    [{ $match: { "time": { "$gte": Start, "$lte": End } } },
                    {
                        $group: {
                            _id: {
                                $dateToString: {
                                    format: "%G/%m/%d",
                                    date: "$time",
                                    timezone: "Asia/Taipei"
                                }
                            },
                            power: { $avg: "$power" }
                        }
                    }
                    ], (err, data) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            console.log(data);
                            if (data.length != 0) {
                                sumPower = data[0].power;
                            }
                            console.log(`${col}:${sumPower}`)
                            resolve(sumPower);
                        }
                    });
            });
        }

        this.cameraPower = function (col) {
            return new Promise(function (resolve, reject) {
                let collection = db.collection(col);
                collection.find().sort({ datetime: -1 }).limit(2).toArray(function (err, items) {
                    if (items.length == 0) {
                        let cameraPowerData = {
                            cameraPowerConsumption: 0,
                            cameraPower: 0,
                            startTime: new Date().toLocaleString(),
                            endTime: new Date().toLocaleString()
                        }
                        resolve(cameraPowerData);
                    } else if (items.length == 1) {
                        let cameraPowerData = {
                            cameraPowerConsumption: Number(items[0].camera_power_consumption),
                            cameraPower: Number(items[0].camera_power_consumption),
                            startTime: new Date(items[0].datetime).toLocaleString(),
                            endTime: '第一筆資料'
                        }
                        resolve(cameraPowerData);
                    } else {
                        let cameraPowerData = {
                            cameraPowerConsumption: Number(items[0].camera_power_consumption - items[1].camera_power_consumption),
                            cameraPower: Number(items[0].camera_power_consumption),
                            startTime: new Date(items[1].datetime).toLocaleString(),
                            endTime: new Date(items[0].datetime).toLocaleString()
                        }
                        resolve(cameraPowerData);
                    }
                });
            });
        }
    }

    async LeftAverageData() {
        let sum = 0, Avg_CO2 = 0, Avg_humid = 0, Avg_temp = 0;
        var timeStart = new Date(new Date(new Date().setMinutes(new Date().getMinutes()-1,0 )) );
        var timeEnd = new Date(new Date(new Date().setMinutes(new Date().getMinutes(),0 )) );
        //var MinsStart = timeStart.toLocaleString('zh-hant', { timeZone: 'Asia/Taipei' })
        //var MinsEnd = timeEnd.toLocaleString('zh-hant', { timeZone: 'Asia/Taipei' })
        console.log(timeStart)
        console.log(timeEnd)
        Avg_CO2 = await this.avgPower('CO2',timeStart, timeEnd);
        Avg_humid = await this.avgPower('Humidity',timeStart, timeEnd);
        Avg_temp = await this.avgPower('Temperature',timeStart, timeEnd);
        // sum = powerMeterPower + upsPower_A + upsPower_B;
        let piePercent = [
            Avg_CO2,
            Avg_humid,
            Avg_temp
            // { name: '氣溫', y: Avg_temp  },
            //  { name: 'UPS1', y: upsPower_A  },
            // { name: 'UPS2', y: upsPower_B  }
        ];
        // { name: HourStart.split(',')[1], y: temp  },
        return piePercent;
    }

    // 計算昨日各設備消耗功率
    async RightAverageData() {
        let sum = 0, Avg_CO2 = 0, Avg_humid = 0, Avg_temp = 0;
        var timeStart = new Date(new Date(new Date().setMinutes(new Date().getMinutes()-1,0 )) );
        var timeEnd = new Date(new Date(new Date().setMinutes(new Date().getMinutes(),0 )) );
        // var MinsStart = timeStart.toLocaleString('zh-hant', { timeZone: 'Asia/Taipei' })
        // var MinsEnd = timeEnd.toLocaleString('zh-hant', { timeZone: 'Asia/Taipei' })
        // console.log(MinsStart)
        // console.log(MinsEnd)
        Avg_CO2 = await this.avgPower('CO2',timeStart, timeEnd);
        Avg_humid = await this.avgPower('Humidity',timeStart, timeEnd);
        Avg_temp = await this.avgPower('Temperature',timeStart, timeEnd);
        // sum = powerMeterPower + upsPower_A + upsPower_B;
        let piePercent = [
            Avg_CO2,
            Avg_humid,
            Avg_temp
            // { name: '氣溫', y: Avg_temp  },
            //  { name: 'UPS1', y: upsPower_A  },
            // { name: 'UPS2', y: upsPower_B  }
        ];
        // { name: HourStart.split(',')[1], y: temp  },
        return piePercent;
    }
    async StorageAverageData() {
        let sum = 0, Avg_CO2 = 0, Avg_humid = 0, Avg_temp = 0;
        var timeStart = new Date(new Date(new Date().setMinutes(new Date().getMinutes()-1,0 )) );
        var timeEnd = new Date(new Date(new Date().setMinutes(new Date().getMinutes(),0 )) );
        // var MinsStart = timeStart.toLocaleString('zh-hant', { timeZone: 'Asia/Taipei' })
        // var MinsEnd = timeEnd.toLocaleString('zh-hant', { timeZone: 'Asia/Taipei' })
        console.log(timeStart)
        console.log(timeEnd)
        Avg_CO2 = await this.avgPower('CO2',timeStart, timeEnd);
        Avg_humid = await this.avgPower('humid',timeStart, timeEnd);
        Avg_temp = await this.avgPower('tempareture',timeStart, timeEnd);
        // sum = powerMeterPower + upsPower_A + upsPower_B;
        let piePercent = [
            Avg_CO2,
            Avg_humid,
            Avg_temp
            // { name: '氣溫', y: Avg_temp  },
            //  { name: 'UPS1', y: upsPower_A  },
            // { name: 'UPS2', y: upsPower_B  }
        ];
        // { name: HourStart.split(',')[1], y: temp  },
        return piePercent;
    }

    insertCameraPower(cameraPowerData) {
        return new Promise(function (resolve, reject) {
            let cameraPowerLog = this.db.collection('cameraPowerLog');
            let insertData = {
                "datetime": new Date(),
                "camera_power_consumption": Number(cameraPowerData)
            };
            cameraPowerLog.insert(insertData, function (err, records) {
                if (err) {
                    reject(err);
                }
                console.log(records);
                resolve();
            });
        }.bind(this));
    }
}
module.exports = MongoDB;

