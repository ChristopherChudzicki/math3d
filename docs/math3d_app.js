var globalTest = {};

class AppMath3D {
    constructor(container, math3d) {
        container.attr("ng-app", 'math3dInteractive')
        container.attr("ng-controller", 'math3dController')

        this.app = angular.module('math3dInteractive', []);

        this.app.controller('math3dController',['$scope', '$sce', function($scope, $sce) {
            // Bind Helper Functions to $scope
            $scope.addOjbectSettingsToGui = (settings) => $sce.trustAsHtml(AppMath3D.addOjbectSettingsToGui(settings));
            
            $scope.test = 0;
            
            // Deep copy mathObject settings
            $scope.objectSettingsList = [];
            for (let j=0; j<math3d.mathObjects.length; j++){
                $scope.objectSettingsList.push(Utility.deepCopyValuesOnly(math3d.mathObjects[j].settings))
            }
            
            globalTest = $scope;
            
        }]);
    }
    
    static addOjbectSettingsToGui(settings){
        var content = `
        <span>${settings.rawExpression}</span><br/>
        <input type="text" ng-model="settings.color">
        `
        return content
    }
}





