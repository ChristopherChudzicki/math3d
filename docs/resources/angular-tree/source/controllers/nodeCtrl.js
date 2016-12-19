(function () {
  'use strict';

  angular.module('ui.tree')
    .controller('TreeNodeController', ['$scope', '$element',
      function ($scope, $element) {
        this.scope = $scope;

        $scope.$element = $element;
        $scope.$modelValue = null; // Model value for node;
        $scope.$parentNodeScope = null; // uiTreeNode Scope of parent node;
        $scope.$childNodesScope = null; // uiTreeNodes Scope of child nodes.
        $scope.$parentNodesScope = null; // uiTreeNodes Scope of parent nodes.
        $scope.$treeScope = null; // uiTree scope
        $scope.$handleScope = null; // it's handle scope
        $scope.$type = 'uiTreeNode';
        $scope.$$allowNodeDrop = false;
        $scope.collapsed = false;
        $scope.expandOnHover = false;

        //Called by uiTreeNode Directive on load.
        $scope.init = function (controllersArr) {
          var treeNodesCtrl = controllersArr[0];
          $scope.$treeScope = controllersArr[1] ? controllersArr[1].scope : null;

          //Find the scope of it's parent node.
          $scope.$parentNodeScope = treeNodesCtrl.scope.$nodeScope;

          //modelValue for current node.
          $scope.$modelValue = treeNodesCtrl.scope.$modelValue[$scope.$index];
          $scope.$parentNodesScope = treeNodesCtrl.scope;

          //Init sub nodes.
          treeNodesCtrl.scope.initSubNode($scope);

          $element.on('$destroy', function () {

            //Destroy sub nodes.
            treeNodesCtrl.scope.destroySubNode($scope);
          });
        };

        //Return the index of child node in parent node (nodesScope).
        $scope.index = function () {
          return $scope.$parentNodesScope.$modelValue.indexOf($scope.$modelValue);
        };

        $scope.dragEnabled = function () {
          return !($scope.$treeScope && !$scope.$treeScope.dragEnabled);
        };

        $scope.isSibling = function (targetNode) {
          return $scope.$parentNodesScope == targetNode.$parentNodesScope;
        };

        $scope.isChild = function (targetNode) {
          var nodes = $scope.childNodes();
          return nodes && nodes.indexOf(targetNode) > -1;
        };

        //TODO(jcarter): This method is on uiTreeHelper already.
        $scope.prev = function () {
          var index = $scope.index();
          if (index > 0) {
            return $scope.siblings()[index - 1];
          }
          return null;
        };

        //Calls childNodes on parent.
        $scope.siblings = function () {
          return $scope.$parentNodesScope.childNodes();
        };

        $scope.childNodesCount = function () {
          return $scope.childNodes() ? $scope.childNodes().length : 0;
        };

        $scope.hasChild = function () {
          return $scope.childNodesCount() > 0;
        };

        $scope.childNodes = function () {
          return $scope.$childNodesScope && $scope.$childNodesScope.$modelValue ?
            $scope.$childNodesScope.childNodes() :
            null;
        };

        $scope.accept = function (sourceNode, destIndex) {
          return $scope.$childNodesScope &&
            $scope.$childNodesScope.$modelValue &&
            $scope.$childNodesScope.accept(sourceNode, destIndex);
        };

        $scope.remove = function () {
          return $scope.$parentNodesScope.removeNode($scope);
        };

        $scope.toggle = function () {
          $scope.collapsed = !$scope.collapsed;
          $scope.$treeScope.$callbacks.toggle($scope.collapsed, $scope);
        };

        $scope.collapse = function () {
          $scope.collapsed = true;
        };

        $scope.expand = function () {
          $scope.collapsed = false;
        };

        $scope.depth = function () {
          var parentNode = $scope.$parentNodeScope;
          if (parentNode) {
            return parentNode.depth() + 1;
          }
          return 1;
        };

        /**
        * Returns the depth of the deepest subtree under this node
        * @param scope a TreeNodesController scope object
        * @returns Depth of all nodes *beneath* this node. If scope belongs to a leaf node, the
        *   result is 0 (it has no subtree).
        */
        function countSubTreeDepth(scope) {
          if (!scope) {
            return 0;
          }
          var thisLevelDepth = 0,
              childNodes = scope.childNodes(),
              childNode,
              childDepth,
              i;
          if (!childNodes || childNodes.length === 0) {
            return 0;
          }
          for (i = childNodes.length - 1; i >= 0 ; i--) {
            childNode = childNodes[i],
            childDepth = 1 + countSubTreeDepth(childNode);
            thisLevelDepth = Math.max(thisLevelDepth, childDepth);
          }
          return thisLevelDepth;
        }

        $scope.maxSubDepth = function () {
          return $scope.$childNodesScope ? countSubTreeDepth($scope.$childNodesScope) : 0;
        };
      }
    ]);
})();
