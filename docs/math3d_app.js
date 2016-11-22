var globalScope = {}; 

class AppMath3D {
    constructor(container, math3d) {
        container.attr("ng-app", 'math3dInteractive')
        container.attr("ng-controller", 'math3dController')

        this.app = angular.module('math3dInteractive', []);
        this.app.directive('compileTemplate', ["$compile", "$parse", function($compile, $parse) {
            // http://stackoverflow.com/a/25407201/2747370
            return {
                restrict: 'A',
                link: function($scope, element, attr) {
                    var parse = $parse(attr.ngBindHtml);
                    function value() { return (parse($scope) || '').toString(); }

                    $scope.$watch(value, function() {
                        $compile(element, null, -9999)($scope); 
                    });
                }
            }
        }]);

        this.app.controller('math3dController',['$scope', '$sce', function($scope, $sce) {
            // Bind Helper Functions to $scope
            $scope.addOjbectToUi = (settings) => $sce.trustAsHtml(AppMath3D.addOjbectToUi(settings));
            $scope.createNewObject = AppMath3D.createNewObject
            
            // Deep copy mathObject settings
            $scope.objectList = [];
            for (let j=0; j<math3d.mathObjects.length; j++){
                let mathObj = math3d.mathObjects[j];
                let uiSettings = Utility.deepCopyValuesOnly(mathObj.settings);
                $scope.objectList.push({uiSettings:uiSettings, mathObj:mathObj, type:mathObj.constructor.name, idx:j})
            }
            
        }]);
        
        this.app.controller('mathObjectController', function($scope){
            $scope.removeMathObj = function(obj){
                obj.mathObj.remove();
                var objectList = $scope.$parent.$parent.objectList;
                var objIdx = objectList.indexOf(this);
                objectList.splice(obj.idx, 1);
            }
            $scope.$watch("$parent.obj.uiSettings", function(newVal, oldVal){
                var settingsDiff = Utility.deepObjectDiff(newVal, oldVal)
                for (let key in settingsDiff){
                    if (key[0] === '$'){
                        delete settingsDiff[key];
                    }
                    if (key ==='color'){
                        settingsDiff[key] = "#" + settingsDiff[key];
                    }
                }
                console.log($scope)
                _.merge($scope.$parent.obj.mathObj.settings, settingsDiff);
            },
            true)
            
        })
     
    }
    
    static addOjbectToUi(obj){

        var color_id = 'color-value-' + _.uniqueId();
        var content = `
        <input class="jscolor hide-text" ng-model="obj.uiSettings.color" ></input>
        <input type="text" ng-model="obj.uiSettings.rawExpression"></input>
        <button type="button" class="btn btn-xs remove-item" ng-click="removeMathObj(obj)">
          <span class="glyphicon glyphicon-remove remove-item"></span>
        </button>
        `
        
        //Re-initialize jscolor palletes. This seems hacky.
        setTimeout(function(){ jscolor.installByClassName("jscolor"); }, 0);
        
        return content
    }
    
    static createNewObject(objectList, type){
        var metaMathObj = {type:type, settings:{}}
        var mathObj = MathObject.renderNewObject(math3d, metaMathObj);
        var uiSettings = Utility.deepCopyValuesOnly(mathObj.settings);
        objectList.push({uiSettings:uiSettings, mathObj:mathObj, type:type});
    }
}





