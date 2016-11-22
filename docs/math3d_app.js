var globalTest = {}; 

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
            $scope.addOjbectSettingsToGui = (settings) => $sce.trustAsHtml(AppMath3D.addOjbectSettingsToGui(settings));
            
            // Deep copy mathObject settings
            $scope.objectSettingsList = [];
            for (let j=0; j<math3d.mathObjects.length; j++){
                $scope.objectSettingsList.push(Utility.deepCopyValuesOnly(math3d.mathObjects[j].settings))
            }
            
            globalTest.scope = $scope;
            
        }]);
    
    }
    
    static addOjbectSettingsToGui(settings){
        var content = `
        <span>${settings.rawExpression}</span><br/>
        <input class="jscolor" ng-model="settings.color">
        `
        return content
    }
}





