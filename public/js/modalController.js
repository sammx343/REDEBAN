angular.module('redeban')
.controller('myModalController', ['$scope','$uibModalInstance','Sell', function($scope, $uibModalInstance, Sell)
{
    $scope.sell = Sell;
    console.log($scope.sell);
    
    $scope.cancel = function () 
    {
      $uibModalInstance.dismiss('cancel');
    };
}]);