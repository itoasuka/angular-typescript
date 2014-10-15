/// <reference path="../../../../typings/tsd.d.ts"/>

class IndexController {
    greeting:string;

    /**
     * @ngInject
     */
    constructor() {
        console.log('ok');
        this.greeting = 'Hello, world!'
    }
}
