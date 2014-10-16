/// <reference path="../../../typings/tsd.d.ts"/>
/// <reference path="controllers/IndexController.ts"/>

/**
 * @ngInject
 */
function config($routeProvider:ng.route.IRouteProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/index.html',
        controller: 'IndexController',
        controllerAs: 'index'
    }).otherwise({
        redirectTo: '/'
    });
}

angular.module('myApp', [
    'ngRoute'
])
    .config(config)
    .controller('IndexController', IndexController);
