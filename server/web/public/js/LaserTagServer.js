(function(window, document, undefined){
   'use strict';


/*
Main AngluarJS file for LaserTagAdminPage
*/

var app = angular.module('laserTagAdminApp', []);


app.controller('GamesListCtrl',function($scope,$http){
    //game page of site
    $scope.message = "Welecome to the games page!";
    //make ajax call to nodejs server and get json object of data needed
    //TODO get request to server api url
    $scope.games = [
    {
        "start_time": "12:00:00",
        "end_time":"3:00:00",
        "name":"Game 1",
        "id":1,
        "date":"2015-03-14"
    }
    ];
    function getAllGames(){
        $http.get("http://cse.taylor.edu").success(function(data){
            console.log("Im in sucka!");
        //console.log(data);
        $scope.allGames = 'Im a Game!';
    })};
    //getAllGames();
});


app.controller('GunsListCtrl',function($scope){
    $scope.message = 'Welcome to the All Guns Page!';
});


app.controller('StatisticsCtrl',function($scope){
    $scope.message = 'Welcome to the Statistics Page!';
});


app.controller('TeamsListCtrl',function($scope){
    $scope.message = 'Welcome to All Teams Page!';
});


}(window, document));
