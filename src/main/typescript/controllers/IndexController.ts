/// <reference path="../../../../typings/tsd.d.ts"/>

class IndexController {
    greeting:string;

    /**
     * @ngInject
     */
    constructor() {
        this.greeting = 'Hello, world!';
    }
}
