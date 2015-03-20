/*
Main AngluarJS file for LaserTagAdminPage
*/

var app = angular.module('laserTagAdminApp', [
'ngRoute'
]);

/**
* Configure the Routes
*/
app.config(['$routeProvider', function ($routeProvider) {
$routeProvider
// Home
.when("/", {
    templateUrl: "partials/home.html",
    controller: "MainCtrl"
})
// TODO Games
.when("/games", {
    templateUrl: "partials/game_index.html",
    controller: "GamesListCtrl"
})
//TODO Teams
.when("/teams", {
    templateUrl: "partials/team_index.html",
    controller: "TeamsListCtrl"
})
//TODO Guns
.when("/guns", {
    templateUrl: "partials/gun_index.html",
    controller: "GunsListCtrl"
})
//TODO Statistics
.when("/statistics", {
    templateUrl: "partials/stat_index.html",
    controller: "StatisticsCtrl"
})
// else 404
.otherwise("/404", {
    templateUrl: "partials/404.html",
    controller: "MainCtrl"
});
}]);

app.controller('MainCtrl',function($scope){
    //main page of site
    $scope.message = 'Welcome to the main page!';
});

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

app.controller('TeamsListCtrl',function($scope){
    $scope.message = 'Welcome to All Teams Page!';
});

//TODO finish this up!
app.controller('TeamsDetailCtrl',function($scope){
    
})

app.controller('GunsListCtrl',function($scope){
    $scope.message = 'Welcome to the All Guns Page!';
});

app.controller('StatisticsCtrl',function($scope){
    $scope.message = 'Welcome to the Statistics Page!';
});
