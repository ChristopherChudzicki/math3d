// MIT License
//
// Copyright (c) 2017 Christopher Chudzicki
// Copyright (c) 2017 Luming Chen
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

var container = $("body")
container.attr("ng-app", 'math3dApp')

// app = angular.module('math3dApp', ['ui.sortable']);
app = angular.module('math3dApp', ['ui.tree', 'ngAnimate', 'ngCookies', 'ui.bootstrap', 'ui.toggle', 'pathgather.popeye', 'pageslide-directive', 'monospaced.elastic']);

// Change default tags to '[[' and ']]' to prevent conflict with Flask
app.config(function($interpolateProvider, $httpProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
    
    // Include csrf_token in every request
    $httpProvider.defaults.xsrfCookieName = "csrf_token";
    $httpProvider.defaults.xsrfHeaderName = "X-CSRFToken";
});

app.directive('compileTemplate', ["$compile", "$parse", function($compile, $parse) {
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

// http://stackoverflow.com/a/29571230/2747370
app.directive( 'elemReady', function( $parse ) {
   return {
       restrict: 'A',
       link: function( $scope, elem, attrs ) {    
          elem.ready(function(){
            $scope.$apply(function(){
                var func = $parse(attrs.elemReady);
                func($scope);
            })
          })
       }
    }
})

// https://gist.github.com/BobNisco/9885852 (modifications in comments)
// Add this directive where you keep your directives
app.directive('onLongPress', function($timeout) {
    return {
		restrict: 'A',
        link: function(scope, elem, attrs) {
            var timeoutHandler;
            
            elem.bind('mousedown touchstart', function() {
                timeoutHandler = $timeout(function() {
                    scope.$eval(attrs.onLongPress);
                }, 600);
            });

            elem.bind('mouseup touchend', function() {
                $timeout.cancel(timeoutHandler);
            });
		}
	};
})
app.directive('onShortPress', function($timeout) {
	return {
		restrict: 'A',
		link: function($scope, $elm, $attrs) {
			$elm.bind('mousedown touchstart', function(evt) {                
                // Locally scoped variable that will keep track of the short press
				$scope.shortPress = true;

				// After a timeout of 600 ms, shortPress is false;
				$timeout(function() {
					$scope.shortPress=false;
				}, 600);
			});

			$elm.bind('mouseup touchend', function(evt) {
                // Some touchscreens seem to trigger both events, so let's prevent onShortPress action from occuring too often (100ms).
                if ($scope.prevent){
                    return;
                } else {
                    $scope.prevent = true;
    				$timeout(function() {
    					$scope.prevent=false;
    				}, 500);
                }
                // Prevent the onShortPress event from firing
                if ($scope.shortPress){
					$scope.$apply(function() {
						$scope.$eval($attrs.onShortPress)
					});
                }
				// If there is an on-touch-end function attached to this element, apply it
				if ($attrs.onTouchEnd) {
					$scope.$apply(function() {
						$scope.$eval($attrs.onTouchEnd)
					});
				}
			});
		}
	};
})

app.controller('treeCtrl', ['$scope', function($scope)  {
    $scope.treeOptions = {
        accept: function(sourceNodeScope, destNodesScope, destIndex) {
            return sourceNodeScope.depth() - 1 === destNodesScope.depth()
        },
        toggle: function(collapsed, sourceNodeScope){
            sourceNodeScope.branch.collapsed = collapsed;
            var reflowInterval = setInterval(function(){
                var failures = reflowBranch(sourceNodeScope['branch']);
                if (failures===0){
                    clearInterval(reflowInterval);
                }
            }, 100);
        }
    };
    
    function reflowBranch(branch){
        // If folders are collapsed on page load, mathquill as are initialized in zero-height spans. We need to reflow each of them when the folder is expanded.
        // Reflow only really needs to be done once, has the mq-reflow tracking class.
        var failures = 0;
        _.forEach(branch.objects, function(obj){
            _.forEach(obj.wrappedMathFields, function(wmf){
                
                var mf = wmf.mathfield;
                var el = $(mf.el());
                if (el.css('height')==='0px'){
                    failures += 1;
                }
                else if ( !el.hasClass('mq-reflowed') ){
                    mf.reflow();
                    el.addClass('mq-reflowed');
                }
                
            })
        })
        
        return failures;
    }

    // Attach the selected object to math3d
    $scope.selectItem = function(item) {
        math3d.selected = item;
    }
}]);

app.service("saveManager", function(){
    _this = this;
    console.log("saveManager is running")
    this.pageJustLoaded = true;
    setTimeout(function(){
        _this.pageJustLoaded = false;
    },3000)
    
    
    this.saveDisabled = false;
    this.disableSaveTemporarily = function disableSaveTemporarily(){
        _this.saveDisabled = true;
        setTimeout( function(){
            _this.saveDisabled = false;
        }, 3000)
    }
})
app.run(['saveManager',function(saveManager){
    
}])

app.controller('saveToDBCtrl', ['$scope', '$http','saveManager', function($scope, $http, saveManager) {
  
    $scope.displayUrl = function() {
        saveToDB()
    }

    function saveToDB(){
        if (saveManager.pageJustLoaded){
            $('#share-url').val("Please wait a few seconds beteween page load and saving a graph.")
            return
        }
        else if (saveManager.saveDisabled){
            $('#share-url').val("Please wait a few seconds between saving graphs")
            return
        }
        var settings = JSON.parse(math3d.serialize());
    
        $http.post("/api/graph/save", {
            title: math3d.settings.title,
            settings: settings,
        }).then(function(response) {
            if (response.data.result == "Success") {
                var graph_url = window.location.host + "/graph/" + response.data.url;
                $('#share-url').val(graph_url)
                saveManager.disableSaveTemporarily()
            }
        });
    }
}]);

app.controller('loadFromDbCtrl', ['$scope', '$http', function($scope, $http) {
  
  $scope.loadGraph = function(short_url) {
      loadGraphFromDB(short_url)
  }
  
  function loadGraphFromDB(short_url){
    $http.post("/api/graph/load", {
        short_url: short_url
    }).then(function(response) {
        if (response.data.result == "Success") {
            math3d.clear()
            math3d.load( JSON.parse(response.data.settings) )
        }
    });
    }
}]);

app.controller('graphListCtrl', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {
    // Using rootScope so that when clicking the Graphs tab this can be called.
    // The graphs tab button is out of the scope of graphListCtrl.
    $rootScope.updateGraphs = function() {
        if ($scope.logged_in) {
            $http.get("/api/graph/get").then(function(response){
                $rootScope.graphs = response.data;
            });
        } else {
            $rootScope.graphs = [];
        }
    }
    
    $scope.loadGraph = function(serialized_string) {
        math3d.clear()
        math3d.load(Math3D.decodeSettingsAsURL64(serialized_string));
    }
    
    $rootScope.updateGraphs();

}]);

app.controller('settingsCtrl', ['$scope', function($scope){
    $scope.math3d = math3d;
}])

app.controller('addObjectCtrl',['$scope', '$sce', function($scope, $sce) {
    $scope.debug = arg => console.log(arg);
    
    $scope.math3d = math3d;
    
    $scope.createNewObject = function(type){
        var metaMathObj = {type:type, settings:{}};

        if (math3d.selected !== undefined) {
            var insertionPoint = math3d.selected.getMathtreePosition();
        }
        var mathObj = MathObject.renderNewObject(math3d, metaMathObj, insertionPoint);
    }
    
    $scope.createNewFolder = function(){
        $scope.math3d.mathTree.push({name:'Untitled', objects:[], collapsed:false});
    }
    
    $scope.addObjectToUi = function(obj){
        var content = `
            <div id="object-${obj.id}" ng-include="'/static/resources/templates/${obj.type.toLowerCase()}.html'">
            </div>`;
        
        //Re-initialize jscolor palletes. This seems hacky.
        setTimeout(function(){ jscolor.installByClassName("jscolor"); }, 0);
        
        return $sce.trustAsHtml(content)
    };
    
    $scope.removeFolder = function(branch){
        // Should only be used if branch is empty
        if (branch.objects.length===0){
            _.remove(math3d.mathTree, function(arg){return arg===branch;});
        }
    }
    
    $scope.setupMathGraphicMF = function(obj){
        var el = $(`#object-${obj.id} span.mathquill-large`)
        if (!el.hasClass('has-mq')){
            var keys = {
                Vector: 'components',
                ExplicitSurface: 'rawExpressionZ',
                ExplicitSurfacePolar:'rawExpressionZ',
            }
            var key = keys[obj.type];
            if (key === undefined){ key = 'rawExpression' };
            var mf = new WrappedMathFieldMain(el[0],obj, key, $scope);
        }
        
    }
    
    $scope.setupVariableMF = function(obj){
        var elName = $(`#object-${obj.id} span.mathquill-large .variable-rawName`);
        var elEqual = $(`#object-${obj.id} span.mathquill-large .variable-equal`);
        var elExpression = $(`#object-${obj.id} span.mathquill-large .variable-rawExpression`);
        
        if (!elName.hasClass('has-mq')){
            new WrappedMathFieldMain(elName[0], obj, 'rawName', $scope);
            new MathQuill.getInterface(2).StaticMath(elEqual[0]);
        }
        if (!elExpression.hasClass('has-mq')){
            new WrappedMathFieldMain(elExpression[0], obj, 'rawExpression', $scope);
        }
    }
    
}]);

app.controller('mathObjectCtrl',['$scope','$timeout', function($scope, $timeout){
    $scope.debug = arg => console.log(arg)
    
    initialize($scope.obj);
     
    $scope.setColor = function(obj){
        document.getElementById(`jscolor-${obj.id}`).jscolor.show()
    }
    $scope.getStyle = function(obj){
        if (obj.settings.visible){
            var backgroundColor = obj.settings.color;
            var borderColor = Utility.lightenColor(obj.settings.color,-0.5);       
        } else {
            var backgroundColor = 'lightgray';
            var borderColor = 'darkgray';
        }
        return `background-color:${backgroundColor}; border-color:${borderColor}`
    }
    
    function initialize(obj){
        if (obj instanceof MathGraphic){
            Utility.extendSetter(obj.settings, 'visible', function(){
                // Call $apply inside timeout; see https://docs.angularjs.org/error/$rootScope/inprog?p0=$apply "Trigger Events Programatically"
                $timeout(function(){
                    $scope.$apply();
                }, 0, false);
            });
        }
    }
}])

app.controller('sliderCtrl', ['$scope', function($scope){
    $scope.intervalID = null;
    $scope.toggleAnimate = function(obj){
        if (!obj.settings.animationRunning){
            $scope.startAnimation(obj)
        }
        else {
            $scope.stopAnimation(obj)
        }
        return
    }
    $scope.startAnimation = function(obj){
        obj.settings.animationRunning = true;
        var ele = document.getElementById("slider-"+obj.id);
        ele.step = ((ele.max-ele.min)/200) * obj.speeds[obj.settings.speedIdx].value;
        
        // Use a less complex representation to avoid getting the slider stuck
        ele.step = Math.fround(ele.step);
        $scope.intervalID = setInterval(function(){
           ele.stepUp();
           if (ele.value > ele.max - ele.step){
               ele.value = ele.min
           }
           angular.element(ele).trigger('input')
        },20)
    }
    $scope.stopAnimation = function(obj){
        obj.settings.animationRunning = false;
        clearInterval($scope.intervalID);
    }
    
    $scope.incrementSpeed = function(obj, incr){
        obj.settings.speedIdx += incr;
        obj.settings.speedIdx = MathUtility.clamp(0, obj.settings.speedIdx, obj.speeds.length - 1);
        $scope.toggleAnimate(obj);
        $scope.toggleAnimate(obj);
    }
    
    $scope.initSlider = function(obj){
        var ele = document.getElementById("slider-"+obj.id);
        ele.step = ((ele.max-ele.min)/200) * obj.speeds[obj.settings.speedIdx].value;
        if (obj.animationStarted === undefined && obj.settings.animationRunning){
            $scope.startAnimation(obj);
            obj.animationStarted = true;
        }
    }
    
}])

//http://stackoverflow.com/a/32366115/2747370
//http://codepen.io/dmvianna/pen/OyNNJx
app.controller('popoverCtrl', ['$scope', function($scope) {
    // query popover
    $scope.myPopover = {
        isOpen: false,
        templateUrl: '/static/resources/templates/settings_popover.html',
        open: function open() {
            $scope.myPopover.isOpen = true;
            $scope.myPopover.data = 'Hello!';
        },
        close: function close() {
            $scope.myPopover.isOpen = false;
        }
    };
}]);

app.controller('controlsCtrl',['$scope', function($scope, $elem){
    $scope.visible = isBigScreen();
    $scope.manuallyTroggled = false;
    
    $scope.toggle = function() {
        $scope.manuallyToggled = true;
        $scope.visible = !$scope.visible;
    }
    
    $(window).on("resize", function(){
        if (! $scope.manuallyToggled){
            $scope.visible = isBigScreen();
        }
    })
    function isBigScreen(){
        return window.matchMedia("(min-width: 768px)").matches
    }
    
}]);

app.controller('examplesCtrl',['$scope',function($scope){
    $scope.visible = false;
    $scope.toggle = function() {
        $scope.visible = !$scope.visible
    }
}]);

// **************************************************
// ModalPop
// **************************************************
// TODO: Figure out how to put this into another file.
// README:
// modalpop is a custom angular directive that modifies angular-bootstrap's popover behavior:
//  - When parent has class modalpop-modal, modalpop appears as a modal
//  - When parent has class modalpop-popover, modalpop appears as a popover
// USAGE:
//  1. Give parent element attribute modalpop
//  2. Give parent element attribute modalpop-contentUrl with content URL
//  3. Give child trigger element class .modalpop-trigger 
// REQUIRES:
// 'pathgather.popeye'

// define additional triggers on Tooltip and Popover
app.config(['$uibTooltipProvider', function($tooltipProvider){
    $tooltipProvider.setTriggers({
        'show': 'hide'
    });
}]);

// https://stackoverflow.com/a/26509316/2747370
app.directive('ngTranscludeReplace', ['$log', function ($log) {
  return {
    terminal: true,
    restrict: 'EA',
    link: function ($scope, $element, $attr, ctrl, transclude) {
      if (!transclude) {
        $log.error('orphan',
        'Illegal use of ngTranscludeReplace directive in the template! ' +
        'No parent directive that requires a transclusion found. ');
        return;
      }
      transclude(function (clone) {
        if (clone.length) {
          $element.replaceWith(clone);
        }
        else {
          $element.remove();
        }
      });
    }
  };
}
]);

app.directive('modalpop', function() {
  return {
    restrict: 'A',
    scope: {
      modalpopContentUrl:'@modalpopContentUrl',
    },
    transclude: true,
    replace: false,
    template:`
<ng-transclude-replace></ng-transclude-replace>
<span
  class = "modalpop-popover-trigger"
  uib-popover-template="{{modalpopContentUrl}}"
  popover-placement="auto"
  popover-trigger="'show outsideClick'"
  popover-append-to-body="false"
/>
    `,
    // templateUrl: 'modalpopover.html',
    controller: ['$scope', 'Popeye', function($scope, Popeye){
      $scope.openModal = function() {
        // Open a modal to show the selected user profile
          var strippedModalpopContentUrl =  $scope.modalpopContentUrl.substring(1, $scope.modalpopContentUrl.length-1)
          var modal = Popeye.openModal({
            scope: $scope,
            templateUrl: strippedModalpopContentUrl,
            containerTemplate: `
<div class="popeye-modal-container">
  <div class="popeye-modal">
  </div>
</div>
          `
        })
      }
    }],
    link: function($scope, $elem, $attrs) {
      $scope.modalpopShow = function(){
        if ($elem.hasClass('modalpop-popover-mode')){
          $('.modalpop-popover-trigger', $elem).trigger('show')
          $elem.addClass('modalpop-popover-open')
        }
        else {
          $scope.openModal();
          $elem.addClass('modalpop-modal-open')
        }
      }
      $scope.modalpopHide = function(){
        if ($elem.hasClass('modalpop-popover-open')){
          $('.modalpop-popover-trigger', $elem).trigger('hide')
          $elem.removeClass('modalpop-popover-open')
        }
        if ($elem.hasClass('modalpop-modal-open')) {
          $scope.$close() //Popeye's close function 
          $elem.removeClass('modalpop-modal-open')
        }
      }
      $('.modalpop-trigger',$elem).bind('click tap', function(){
        $scope.modalpopShow();
      })
    }
  };
});

// **************************************************
// End ModalPop
// **************************************************

// Prevent key events from bubbling up to the 3d scene
container.on("keypress keydown keyup", function(e) {
    e.stopPropagation();
});