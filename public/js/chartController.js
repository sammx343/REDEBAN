angular.module('redeban')
.controller("chartController", ['$scope','$route' ,'$routeParams', 'NgTableParams', '$uibModal',
function($scope, $route, $routeParams, NgTableParams, $uibModal){

  var valorTotal = 0;
  $scope.valorTotalToString = "$0";
  var timeData = [createTime(30)];
  var numbers = [];
  var moneyArray = [];
  $scope.sells = [];
  var borderColorNum = 0;
  
  $scope.usuario = "";
  $scope.clientName = "";
  if($routeParams.id == 1){
    $scope.usuario = "usuarioA";
    $scope.clientName = "Cadena Restaurantes X";
  }else{
    $scope.usuario = "usuarioB";
    $scope.clientName = "Cadena Restaurantes Y";
  }

  var ctx = document.getElementById('myChart').getContext('2d');
  var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
          labels: timeData,
          datasets: [{
              fill: false,
              label: "",
              backgroundColor: '#33559d',
              borderColor: '#76aadb',
              data: moneyArray,
          }]
      },

      // Configuration options go here
      options: {        
        title: {
          display: false
        },
        scales: {
            yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Miles de Pesos'
                },
                ticks: {
                    beginAtZero: true,
                    min: 0,
                    max: 1000000,
                    callback: function(value, index, values) {
                      value = value/1000;
                      if(parseInt(value) >= 1000 || parseInt(value) <= 1000){
                        return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                      } else {
                        return '$' + value;
                      }
                    }
                }
            }]
        }
      }
  });

  /*setInterval(function(){ 

    var d = new Date();
    var dateTime = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    
    var num = rnd(-900000, 900000);

    valorTotal += num;
    $scope.valorTotalToString = formatter.format(valorTotal);  

    timeData.splice(timeData.length-1, 0 , dateTime);

    moneyArray.push(num);

    var sell = {ciudad: "Barranquilla",
                  money: formatter.format(num),
                  time: dateTime,
                  tipoTarjeta: "MasterCard"};

    console.log(sell);           
    
    $scope.$apply(function () {
      $scope.sells.push(sell); 
    });
    console.log($scope.sells); 
    chart.update();
  }, 5000);
*/

  var ws = new WebSocket('wss://' + location.host);
  ws.onopen = function () {
    console.log('Successfully connect WebSocket');
  }
  ws.onmessage = function (message) {
    console.log('receive message' + message.data + " " + $routeParams.id);
    try {
      var obj = JSON.parse(message.data);
      console.log(obj);
      if( !obj.time || !obj.money || $routeParams.id != obj.chartId) {
        return;
      }

      valorTotal += Number(obj.money);
      $scope.valorTotalToString = moneyFormatter(valorTotal);  

      timeData.splice(timeData.length-1, 0 , createTime(0))
      moneyArray.push(obj.money);
      // only keep no more than 50 points in the line chart
      const maxLen = 50;
      var len = timeData.length;
      if (len > maxLen) {
        timeData.shift();
        moneyArray.shift();
      }

      var time = obj.time + "";

      var sell = {ciudad: obj.ciudad,
                  codigo: obj.codigo,
                  deviceId: obj.deviceId,
                  money: moneyFormatter(obj.money),
                  nit: obj.nit,
                  numeroTX: obj.numeroTX,
                  time: time.slice(time.length-8, time.length),
                  tarjeta: obj.tarjeta,
                  tipoTarjeta: obj.tipoTarjeta};
                  
      $scope.$apply(function () {
        $scope.sells.push(sell); 
      });
      console.log($scope.sells); 
      chart.update();
    } catch (err) {
      console.error(err);
    }
  }

  $scope.openModal = function (sell){
       var modalInstance = $uibModal.open({
       templateUrl: 'templates/myModal.html',
       controller: 'myModalController',
       size: 'md',
       resolve: {
        Sell: function()
           {
              return sell;
           }
        }
       });
  }

  function createTime(addedTime){
    var d = new Date();
    d.setMinutes( d.getMinutes() + addedTime );
    var dateTime = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    return dateTime;
  }

  function moneyFormatter(num){
    var money = formatter.format(num) + "";
    return money.replace(',','.');
  }

  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    // the default value for minimumFractionDigits depends on the currency
    // and is usually already 2
  });

  function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }
}]);