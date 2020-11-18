socket.on("fan1", function(data){
  document.getElementById("fan1").innerHTML = data;
  console.log(data);
});
socket.on("fan2", function(data){
  document.getElementById("fan2").innerHTML = data;
  console.log(data);
})
socket.on("fan3", function(data){
  document.getElementById("fan3").innerHTML = data;
  console.log(data);
})
socket.on("fan4", function(data){
  document.getElementById("fan4").innerHTML = data;
  console.log(data); 
})
socket.on("humid_left", function(data){
  document.getElementById("humid_left").innerHTML = data;
  console.log(data); 
})
socket.on("tempareture_left", function(data){
  document.getElementById("tempareture_left").innerHTML = data;
  console.log(data); 
})
socket.on("CO2_left", function(data){
  document.getElementById("CO2_left").innerHTML = data;
  console.log(data); 
})
socket.on("TVOC_left", function(data){
  document.getElementById("TVOC_left").innerHTML = data;
  console.log(data); 
})
socket.on("humid_right", function(data){
  document.getElementById("humid_right").innerHTML = data;
  console.log(data); 
})
socket.on("tempareture_right", function(data){
  document.getElementById("tempareture_right").innerHTML = data;
  console.log(data); 
})
socket.on("CO2_right", function(data){
  document.getElementById("CO2_right").innerHTML = data;
  console.log(data); 
})
socket.on("TVOC_right", function(data){
  document.getElementById("TVOC_right").innerHTML = data;
  console.log(data); 
})
socket.on("Avg_temp_left", function(data){
  document.getElementById("Avg_temp_left").innerHTML = data;
  console.log(data); 
})
socket.on("Avg_humid_left", function(data){
  document.getElementById("Avg_humid_left").innerHTML = data;
  console.log(data); 
})
socket.on("Avg_CO2_left", function(data){
  document.getElementById("Avg_CO2_left").innerHTML = data;
  console.log(data); 
})
socket.on("Avg_temp_right", function(data){
  document.getElementById("Avg_temp_right").innerHTML = data;
  console.log(data); 
})
socket.on("Avg_humid_right", function(data){
  document.getElementById("Avg_humid_right").innerHTML = data;
  console.log(data); 
})
socket.on("Avg_CO2_right", function(data){
  document.getElementById("Avg_CO2_right").innerHTML = data;
  console.log(data); 
})
