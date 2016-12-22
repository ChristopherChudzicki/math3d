'use strict';

class Utility {
    static defaultVal(variable, defaultVal) {
        return typeof variable !== 'undefined' ? variable : defaultVal;
    }
    
    static detectObjectDifferences(a,b){
        // Returns keys that appear in the difference a - b
        // http://stackoverflow.com/a/31686152/2747370
        var diffKeys = _.reduce(a, function(result, value, key) {
            return _.isEqual(value, b[key]) ? result : result.concat(key);
        }, []);
        return diffKeys
    }

    static isPureObject(arg){
        // Test if something is an object. 
        // OK, [1,2,3] is an object in JS. I mean test if something is an object like {a:1,b:[1,2,3],c:{aa:5}}.
        return arg !== null && typeof arg === 'object' && !Array.isArray(arg)
    }

    static deepObjectDiff(a, b){
        var diff = {};
        var keys = Utility.detectObjectDifferences(a,b);
        for (var j=0; j < keys.length; j++){
            var key = keys[j];
            var aValue = a[key];
            var bValue = b[key];
            if ( Utility.isPureObject(aValue) && Utility.isPureObject(bValue) ){
                diff[key] = Utility.deepObjectDiff(aValue, bValue);
            }
            else {
                diff[key] = aValue;
            }
        }
        return diff
    }

    static deepCopyValuesOnly(obj){
        //Intended to help serialize objects with a getter named KEY that stores values in _KEY.
        // FIXME I'm not 100% sure this actually copies the object ... strings, numbers, arrays, will definitely be copied.
        var deepCopy = {};
        for (var key in obj){
            if (key[0]=='_'){
                //In this case, the object should have a getter, but let's check
                var subkey = key.substring(1)
                if (obj[subkey] !== undefined && typeof Object.getOwnPropertyDescriptor(obj,subkey).get === 'function'){
                    key = subkey
                }
            }
            if ( deepCopy.hasOwnProperty(key) ){
                throw `Error: Input Object has both ${key} and _${key} properties.`
            }
            if (Utility.isPureObject(obj[key])){
                deepCopy[key] = Utility.deepCopyValuesOnly(obj[key]);
            } if ( Array.isArray(obj[key]) ) {
                deepCopy[key] = obj[key].slice(); // if array, make a new copy
            } else {
                deepCopy[key] = obj[key];
            }
        }
        return deepCopy;
    }

    static getQueryString() {
        // modified from http://stackoverflow.com/a/979995/2747370
        var query_string = {};
        var query = window.location.search.substring(1);
        if (query === ""){
            return query_string
        }
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    }
    
    static namedColorToHexColor(color){
        color = color.toLowerCase();
        var namedColors = {
            aliceblue: '#F0F8FF', antiquewhite: '#FAEBD7', aqua: '#00FFFF', aquamarine: '#7FFFD4', azure: '#F0FFFF', beige: '#F5F5DC', bisque: '#FFE4C4', black: '#000000', blanchedalmond: '#FFEBCD', blue: '#0000FF', blueviolet: '#8A2BE2', brown: '#A52A2A', burlywood: '#DEB887', cadetblue: '#5F9EA0', chartreuse: '#7FFF00', chocolate: '#D2691E', coral: '#FF7F50', cornflowerblue: '#6495ED', cornsilk: '#FFF8DC', crimson: '#DC143C', cyan: '#00FFFF', darkblue: '#00008B', darkcyan: '#008B8B', darkgoldenrod: '#B8860B', darkgray: '#A9A9A9', darkgrey: '#A9A9A9', darkgreen: '#006400', darkkhaki: '#BDB76B', darkmagenta: '#8B008B', darkolivegreen: '#556B2F', darkorange: '#FF8C00', darkorchid: '#9932CC', darkred: '#8B0000', darksalmon: '#E9967A', darkseagreen: '#8FBC8F', darkslateblue: '#483D8B', darkslategray: '#2F4F4F', darkslategrey: '#2F4F4F', darkturquoise: '#00CED1', darkviolet: '#9400D3', deeppink: '#FF1493', deepskyblue: '#00BFFF', dimgray: '#696969', dimgrey: '#696969', dodgerblue: '#1E90FF', firebrick: '#B22222', floralwhite: '#FFFAF0', forestgreen: '#228B22', fuchsia: '#FF00FF', gainsboro: '#DCDCDC', ghostwhite: '#F8F8FF', gold: '#FFD700', goldenrod: '#DAA520', gray: '#808080', grey: '#808080', green: '#008000', greenyellow: '#ADFF2F', honeydew: '#F0FFF0', hotpink: '#FF69B4', indianred: '#CD5C5C', indigo: '#4B0082', ivory: '#FFFFF0', khaki: '#F0E68C', lavender: '#E6E6FA', lavenderblush: '#FFF0F5', lawngreen: '#7CFC00', lemonchiffon: '#FFFACD', lightblue: '#ADD8E6', lightcoral: '#F08080', lightcyan: '#E0FFFF', lightgoldenrodyellow: '#FAFAD2', lightgray: '#D3D3D3', lightgrey: '#D3D3D3', lightgreen: '#90EE90', lightpink: '#FFB6C1', lightsalmon: '#FFA07A', lightseagreen: '#20B2AA', lightskyblue: '#87CEFA', lightslategray: '#778899', lightslategrey: '#778899', lightsteelblue: '#B0C4DE', lightyellow: '#FFFFE0', lime: '#00FF00', limegreen: '#32CD32', linen: '#FAF0E6', magenta: '#FF00FF', maroon: '#800000', mediumaquamarine: '#66CDAA', mediumblue: '#0000CD', mediumorchid: '#BA55D3', mediumpurple: '#9370DB', mediumseagreen: '#3CB371', mediumslateblue: '#7B68EE', mediumspringgreen: '#00FA9A', mediumturquoise: '#48D1CC', mediumvioletred: '#C71585', midnightblue: '#191970', mintcream: '#F5FFFA', mistyrose: '#FFE4E1', moccasin: '#FFE4B5', navajowhite: '#FFDEAD', navy: '#000080', oldlace: '#FDF5E6', olive: '#808000', olivedrab: '#6B8E23', orange: '#FFA500', orangered: '#FF4500', orchid: '#DA70D6', palegoldenrod: '#EEE8AA', palegreen: '#98FB98', paleturquoise: '#AFEEEE', palevioletred: '#DB7093', papayawhip: '#FFEFD5', peachpuff: '#FFDAB9', peru: '#CD853F', pink: '#FFC0CB', plum: '#DDA0DD', powderblue: '#B0E0E6', purple: '#800080', rebeccapurple: '#663399', red: '#FF0000', rosybrown: '#BC8F8F', royalblue: '#4169E1', saddlebrown: '#8B4513', salmon: '#FA8072', sandybrown: '#F4A460', seagreen: '#2E8B57', seashell: '#FFF5EE', sienna: '#A0522D', silver: '#C0C0C0', skyblue: '#87CEEB', slateblue: '#6A5ACD', slategray: '#708090', slategrey: '#708090', snow: '#FFFAFA', springgreen: '#00FF7F', steelblue: '#4682B4', tan: '#D2B48C', teal: '#008080', thistle: '#D8BFD8', tomato: '#FF6347', turquoise: '#40E0D0', violet: '#EE82EE', wheat: '#F5DEB3', white: '#FFFFFF', whitesmoke: '#F5F5F5', yellow: '#FFFF00', yellowgreen: '#9ACD32'
        };
        return namedColors[color];
    }
    
    static lightenColor(color, amt){
    //color should be hex or named. First get hex color if it is named
    if (color[0] != "#"){
        //http://www.w3schools.com/colors/colors_names.asp
        color = Utility.namedColorToHexColor(color);
    }
    
    if (color === undefined){
        return false
    }
    
    //Now that we have hex, let's lighten it
    //http://stackoverflow.com/a/13532993/2747370
    var R = parseInt(color.substring(1,3),16),
        G = parseInt(color.substring(3,5),16),
        B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (1 + amt) );
    G = parseInt(G * (1 + amt) );
    B = parseInt(B * (1 + amt) );

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
    }

    static assert(condition, message){
        if (!condition) {
            var message = Utility.defaultVal(message, "Assertion Failed");
            if (typeof Error !== "undefined") {
                throw new Error(message);
            }
            throw message; // Fallback
        }
    }

}

class Math3D {
    constructor(settings){
        this.swizzleOrder = Utility.defaultVal(settings.swizzleOrder, 'yzx');
        this.settings = this.setDefaults(settings);
    
        this.mathbox = this.initializeMathBox();
        this.scene = this.setupScene();
        this.updateRange();
    
        // Initial Drawing
        this.drawAxes();
        this.drawGrids();
        
        // Add getters and setters for updating after initial rendering
        this.settings = this.makeDynamicSettings();
        
        // create math scope
        this.mathScope = new WatchedScope(this.settings.mathScope)
        this.mathTree = [] //onVariableChange checks mathTree, so define it as empty for now.
        var onVariableChange = this.onVariableChange.bind(this);
        for (let key in this.settings.mathScope){
            let val = this.settings.mathScope[key];
            this.mathScope.addVariable(key, val, onVariableChange)
        }
        
        //Render math objects; this will update this.mathTree
        this.renderMathObjects();
    }
    
    setDefaults(settings){
        this.defaultSettings = {
            containerId: null,
            range: {
                xMin: -5,
                xMax: +5,
                yMin: -5,
                yMax: +5,
                zMin: -5,
                zMax: +5
            },
            scale: [1, 1, 0.5],
            camera: {
                position: [-0.75,-1.5,0.25],
            },
            grids: {
                xy: true,
                xz: false,
                yz: false
            },
            axes: {
                'x': genDefaultAxisSettings.call(this,'x', 'x'),
                'y': genDefaultAxisSettings.call(this,'y', 'y'),
                'z': genDefaultAxisSettings.call(this,'z', 'z'),
            },
            mathScope:{
                'pi': Math.PI,
                'e': Math.E,
                'i': [1,0,0],
                'j': [0,1,0],
                'k': [0,0,1],
            },
            wrappedMathTree: [
                {
                    name: "General",
                    objects: []
                }
            ]
        }
    
        function genDefaultAxisSettings(axisId, axisLabel) {        
            // swizzle: user ---> mathbox
            // double swizzle: mathbox ---> user
            var mathboxAxes = this.swizzle(this.swizzle({x:'x', y:'y', z:'z'}))
        
            if (axisId === 'z') {
                var tickLabelOffset = [20,0,0];
            } else {
                var tickLabelOffset = undefined;
            }
        
            var defaultAxisSettings = {
                axisLabel: axisLabel,
                labelOffset: [0,40,0],
                axis: {width:2, axis: mathboxAxes[axisId]},
                scale: {divide:10, nice:true, zero:false, axis: mathboxAxes[axisId] },
                ticks: {width:2},
                ticksFormat: {digits:2},
                ticksLabel: {offset:tickLabelOffset, visible:true}
            };
        
            return defaultAxisSettings
        }
    
        settings = _.merge({},this.defaultSettings, settings);
        return settings
    }

    makeDynamicSettings(){
        var math3d = this;
        var dynamicSettings = {
            range: {},
            grids: {}
        }
    
        Object.defineProperties(dynamicSettings.range,{
            xMin: {
                set: function(val){ this._xMin = val; math3d.updateRange();},
                get: function(){ return this._xMin; }
            },
            xMax: {
                set: function(val){ this._xMax = val; math3d.updateRange(); math3d.updateAxisLabelPositions();},
                get: function(){ return this._xMax; }
            },
            yMin: {
                set: function(val){ this._yMin = val; math3d.updateRange();},
                get: function(){ return this._yMin; }
            },
            yMax: {
                set: function(val){ this._yMax = val; math3d.updateRange(); math3d.updateAxisLabelPositions(); },
                get: function(){ return this._yMax; }
            },
            zMin: {
                set: function(val){ this._zMin = val; math3d.updateRange();},
                get: function(){ return this._zMin; }
            },
            zMax: {
                set: function(val){ this._zMax = val; math3d.updateRange(); math3d.updateAxisLabelPositions(); },
                get: function(){ return this._zMax; }
            },
        })
    
        Object.defineProperties(dynamicSettings.grids,{
            xy: {
                set: function(val){ this._xy = val; math3d.scene.select('#xy-grid').set('visible',val);},
                get: function(){ return this._xy; }
            },
            xz: {
                set: function(val){ this._xz = val; math3d.scene.select('#xz-grid').set('visible',val);},
                get: function(){ return this._xz; }
            },
            yz: {
                set: function(val){ this._yz = val; math3d.scene.select('#yz-grid').set('visible',val);},
                get: function(){ return this._yz; }
            }
        })
    
        return _.merge(dynamicSettings, this.settings);
    
    }

    swizzle(arg, swizzleOrder){
        // similar to mathbox swizzle operator, but for regular arrays and objects.
        // Example: swizzle([1,2,3], 'zyx') = [3,2,1]
        swizzleOrder = Utility.defaultVal(swizzleOrder, this.swizzleOrder);
        if (Array.isArray(arg)){
            return swizzleArray(arg, swizzleOrder)
        }
        else {
            return swizzleObject(arg, swizzleOrder)
        }
        function swizzleArray(array, swizzleOrder){
            var keys = {'x':0, 'y': 1, 'z': 2, 'w':3}
            return swizzleOrder.split('').map(function(elem){return array[keys[elem]] })
        }
        function swizzleObject(object, swizzleOrder){
            var newObject = {};
            var oldKeys = ['x','y','z','w'];
            var newKeys = swizzleOrder.split('');
            for (var j=0; j < newKeys.length; j++){
                newObject[ oldKeys[j] ] = object[ newKeys[j] ];
            }
            return newObject
        }
    }

    initializeMathBox(){
        var settings = this.settings
    
        // if necessary, add a container for mathbox
        if ($("#"+settings.containerId).length === 0){
            settings.containerId = _.uniqueId();
            this.container = $("<div class='mathbox-container'></div>");
            this.container.attr('id',settings.containerId);
            $('body').append(this.container);
        } else {
            this.container = $("#"+settings.containerId)
            this.container.addClass('mathbox-container');
        }
    
        var plugins = ['core', 'cursor','controls'];
        var controls = {klass:THREE.OrbitControls};
        var mathbox = mathBox({
            plugins: plugins,
            controls: controls,
            element: this.container[0]
        });
    
        // setup camera
        mathbox.camera({
            proxy: true,
            position: this.swizzle(settings.camera.position),
        });
        mathbox.three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
    
        return mathbox;
    }

    setupScene(){
        var scene = this.mathbox
            .set({
                focus: this.settings.focus,
            })
            .cartesian({
                scale: this.swizzle(this.settings.scale)
            });
        
        return scene
    }

    drawAxes(){
    
        var axesGroup = this.scene.group().set('classes', ['axes-group']);
        drawSingleAxis.call(this, 'x');
        drawSingleAxis.call(this, 'y');
        drawSingleAxis.call(this, 'z');
    
        function drawSingleAxis(axisId){
            var axisSettings = this.settings.axes[axisId];
        
            var axisNums = {'x':0,'y':1,'z':2};
            var axisNum = axisNums[axisId];
            var labelPos = [0,0,0];
            labelPos[axisNum] = this.settings.range[axisId+'Max'];
            labelPos = this.swizzle(labelPos);
        
            axesGroup.group()
                .set('id','axis-' + axisId)
                .set('classes',['axis'])
                .axis(axisSettings.axis)
                .scale(axisSettings.scale)
                .ticks(axisSettings.ticks)
                .format(axisSettings.ticksFormat)
                .label(axisSettings.ticksLabel)
                .set('classes',['tick-labels'])
                .group()
                    .set('classes',['axis-label'])
                    .array({
                        data: [labelPos],
                        channels: 3,
                        live: false
                    })
                    .text({
                        data: [ axisSettings.axisLabel ],
                        weight: 'bold',
                    })
                    .label({
                        offset: axisSettings.labelOffset
                    })
                .end()
            .end();
        }
    }

    updateAxisLabelPositions(){
        var axisNums = {'x':0,'y':1,'z':2};
    
        for (var axisId in axisNums){
            var axisNum = axisNums[axisId];
            var labelPos = [0,0,0];
            labelPos[axisNum] = this.settings.range[axisId+'Max'];
            labelPos = this.swizzle(labelPos);
            this.scene.select("#axis-" + axisId + " .axis-label array").set('data', [labelPos]);
        }
    }

    updateRange(){
        var range = this.settings.range;
        this.scene.set("range", this.swizzle([
            [range.xMin, range.xMax],
            [range.yMin, range.yMax],
            [range.zMin, range.zMax]
        ]) );
    }

    drawGrids(){
        // TODO: enable drawing of other grids
        var divX = 10;
        var divY = divX * this.settings.scale[1]/this.settings.scale[0]
        var divZ = divZ * this.settings.scale[2]/this.settings.scale[0]
    
        var trueAxes = this.swizzle(this.swizzle({x:'x', y:'y', z:'z'}))
    
        var grids = this.scene.group()
            .set('classes',['grids']);
        
        grids.grid({
            id: 'xy-grid',
            axes: [trueAxes.x, trueAxes.y],
            width: 1,  
            divideX: divX,
            divideY: divY,
            opacity:0.5,
            visible:this.settings.grids.xy
        });
        
        grids.grid({
            id: 'xz-grid',
            axes: [trueAxes.x, trueAxes.z],
            width: 1,
            divideX: divX,
            divideY: divZ,
            opacity:0.5,
            visible:this.settings.grids.xz
        });

        grids.grid({
            id: 'yz-grid',
            axes: [trueAxes.y, trueAxes.z],
            width: 1,
            divideX: divY,
            divideY: divZ,
            opacity:0.5,
            visible:this.settings.grids.yz
        });
    
    }
    
    renderMathObjects(){
        var _this = this;
        _.forEach(this.settings.wrappedMathTree, function(branch, idx){
            var branchCopy = {
                name: branch.name,
                objects: []
            };
            _this.mathTree.push(branchCopy);
            _.forEach(branch.objects, function(metaObj, idx){
                // creating a new object appends to last branch
                var mathObj = MathObject.renderNewObject(_this, metaObj);
            });
        })
        this.settings.wrappedMathTree = [];
    }
    
    onVariableChange(varName){
        // update objects where the variables have changed
        _.forEach(this.mathTree, function(branch, idx){
            _.forEach(branch.objects, function(obj, idx){
                if ( _.contains( obj.variables, varName) ){
                    obj.recalculateData();
                }
            })
        })
    }
    
    serialize(settings){
        //Do not copy this.mathScope; those anything added to mathScope should be stored in mathTree;
        
        settings = Utility.defaultVal(settings, this.settings);
        // copy settings values, no setters and getters
        var rawSettings = Utility.deepCopyValuesOnly(this.settings)
        // camera is a THREE js Vec3 object
        var camera = this.mathbox.three.camera.position;
        // Round camera positions to keep encoded settings small.
        rawSettings.camera.position = [camera.x, camera.y, camera.z].map( function(x){return Math.round(x*1000)/1000; } );
        rawSettings.camera.position = this.swizzle(this.swizzle(rawSettings.camera.position));
        // add math objects
        _.forEach(this.mathTree, function(branch){
            rawSettings.wrappedMathTree.push({name:branch.name, objects:[]});
            var serialBranch = rawSettings.wrappedMathTree[rawSettings.wrappedMathTree.length-1];
            _.forEach(branch.objects, function(mathObj){
                serialBranch.objects.push( JSON.parse(mathObj.serialize()) ); // serialized then parsed to remove getters and setters
            });
        });
        return JSON.stringify(Utility.deepObjectDiff(rawSettings,this.defaultSettings));
    }
    
    saveSettingsAsURL(settings){
        settings = Utility.defaultVal(settings, this.settings);
        var settingsDiff64 = window.btoa( this.serialize(settings) );
        var url = window.location.href.split('?')[0] + "?settings=" + settingsDiff64;
        return url
    }
    
    static decodeSettingsAsURL64(encodedSettings){
        var settings = JSON.parse(window.atob(encodedSettings))
        
        return settings
    }
}

class WatchedScope{
    //An object where each property is watched for change
    constructor(){
    }
    
    addVariable(key, val, onChangeFunction){
        // If key already defined, return false; else add variable and return true
        if (this.hasOwnProperty(key) || key === ''){
            return false;
        }
        else {
            Object.defineProperty(this, key, {
                get: function(){return this['_'+key];},
                set: function(val){
                    this['_'+key] = val;
                    onChangeFunction(key, val);
                },
                configurable:true
            })
            this[key] = val
            return true
        }
        
    }
    
    removeVariable(key){
        delete this["_"+key];
        delete this[key];
    }

    serialize(){
        var rawSettings = Utility.deepCopyValuesOnly(this)
        console.log(rawSettings);
        return JSON.stringify(rawSettings);
    }

}

class MathExpression {
    // Holds data for math expressions.
    constructor(expression){
        // store initial representation
        this.expression = expression;
        
        var parsed = this.parse();
        
        this.variables = []
        this.functions = []
        
        parsed.traverse(function(node){
            if (node.type === 'SymbolNode'){ this.variables.push(node.name); }
            if (node.type === 'FunctionNode'){ this.functions.push(node.name); }
        }.bind(this))

        var compiled = parsed.compile();
        
        if (expression[0]=="["){
            this.eval = function(scope){
                return compiled.eval(scope).toArray();
            }
        } else {
            this.eval = function(scope){
                return compiled.eval(scope);
            }
        }

    }
    
    parse(){
        // Cross and dot products are not built into mathjs express. Let's replace "cross" and "dot" by mathjs operators that we probably won't use. Then we'll reassign functionality to these operators.
        this.expression = this.expression.replace(/dot/g, '|');
        this.expression = this.expression.replace(/cross/g, '&');
        var parsed = math.parse(this.expression);

        parsed.traverse(function(node){
            if (node.type === 'OperatorNode' && node.op === '|'){
                node.fn = 'dot';
            } 
            if (node.type === 'OperatorNode' && node.op === '&'){
                node.fn = 'cross';
            }
        }.bind(this))
        this.expression = this.expression.replace(/:/,'dot')
        this.expression = this.expression.replace(/&/,'cross')
        return parsed
    }
}

// Abstract
class MathObject {
    constructor(math3d, settings){
        /*Guidelines:
            this.settings: 
                should only contain information intended for serialization.
                if MEOW is a getter/setter, store associated value in _MEOW
        */
        this.math3d = math3d;
        // Add new objects to newest mathTree branch
        math3d.mathTree[math3d.mathTree.length-1].objects.push(this);
        
        this.type = this.constructor.name;
    }
    
    setDefaults(settings){
        _.merge(this.settings, this.defaultSettings, settings);
        return this.settings;
    }
    
    parseRawExpression(expr){
        return new MathExpression(expr);
    }
    
    serialize(){
        // copy settings values, no setters and getters
        var rawSettings = Utility.deepCopyValuesOnly(this.settings)
        var metaObj = {
            type: this.constructor.name,
            settings: Utility.deepObjectDiff(rawSettings, this.defaultSettings)
        }
        // Our object setters store values in properties prefixed with '_'. Let's remove the underscores.
        return JSON.stringify(metaObj);
    };
    
    remove(){
        var objIdx = -1;
        var branchIdx = -1;
        while (objIdx < 0){
            branchIdx+= 1;
            var objIdx = this.math3d.mathTree[branchIdx].objects.indexOf(this);
        }
        this.math3d.mathTree[branchIdx].objects.splice(objIdx, 1);
    }
    
    static renderNewObject(math3d, metaObj) {
        if (metaObj.type === 'MathObject'){
            return new MathObject(math3d, metaObj.settings)
        };
        if (metaObj.type === 'Variable'){
            return new Variable(math3d, metaObj.settings)
        };
        if (metaObj.type === 'VariableSlider'){
            return new VariableSlider(math3d, metaObj.settings)
        };
        
        if (metaObj.type === 'Point'){
            return new Point(math3d, metaObj.settings)
        };
        if (metaObj.type === 'Line'){
            return new Line(math3d, metaObj.settings)
        };
        if (metaObj.type === 'Vector'){
            return new Vector(math3d, metaObj.settings)
        };
        if (metaObj.type === 'ParametricCurve'){
            return new ParametricCurve(math3d, metaObj.settings)
        };
        if (metaObj.type === 'ParametricSurface'){
            return new ParametricSurface(math3d, metaObj.settings)
        };
    }
}

class AbstractVariable extends MathObject{
    constructor(math3d, settings){
        super(math3d, settings);
        
        this.name = null;
        this.lastValidName = null;
        this.variables = [];
        
        var _this = this;
        this.settings = {};
        Object.defineProperties(this.settings,{
            name: {
                set: function(val){
                    // _this.name: current name
                    // val: new name
                    this._name = val;
                    val = _this.setName(val);
                },
                get: function(val){
                    return this._name;
                }
            }
        });     
    }
    setName(newName){
        this.math3d.mathScope.removeVariable(this.lastValidName);
        this.valid = this.addVarToMathScope(newName);

        if (this.valid) {
            this.lastValidName = newName;
        }
        this.name = newName;
        
        // name change might cause other variables to be valid. Let's check
        this.updateOthers();
        
        return newName;
    }
    // addVarToMathScope(newName){} defined by all subclasses
    
    
    remove(){
        this.math3d.mathScope.removeVariable(this.lastValidName);
        MathObject.prototype.remove.call(this);
    }
    updateOthers(){
        var _this = this;
        _.forEach(this.math3d.mathTree, function(branch){
            _.forEach(branch.objects, function(obj){
                if (obj.constructor.prototype instanceof AbstractVariable && obj !== _this ){
                    obj.math3d.mathScope.removeVariable(obj.name);
                    obj.valid = obj.addVarToMathScope(obj.name);
                }
            })
        })
    }
}

class Variable extends AbstractVariable{
    constructor(math3d, settings){
        super(math3d, settings);
        this.expression = null;
        this.argNames = null;
        this.function = null;
        
        var _this = this;
        Object.defineProperties(this.settings,{
            rawExpression: {
                set: function(val){
                    this._rawExpression = val;
                    _this.setRawExpression(val);
                },
                get: function(){
                    return this._rawExpression;
                }
            },
            rawName:{
                set: function(val){
                    this._rawName = val;
                    _this.setRawName(val);
                },
                get: function(){
                    return this._rawName;
                }
            }
        });
        this.settings = this.setDefaults(settings);
        
    }
    
    get defaultSettings(){
        var defaults = {
            rawName: 'f(t)',
            rawExpression: 'e^t'
        }
        return defaults
    }
    
    setRawName(val){
        var expr = this.parseRawExpression(val);
        // expr should be something like f_1(s,t); should have 1 function and 0+ variables
        if (expr.functions.length === 1){
            this.function = true;
            this.argNames = expr.variables;
            this.settings.name = expr.functions[0];
        }
        else if (expr.functions.length === 0) {
            this.function = false;
            this.argNames = []
            this.settings.name = expr.variables[0];
        } else {}
    }
    addVarToMathScope(newName){
         var onVariableChange = this.math3d.onVariableChange.bind(this.math3d);
         return this.math3d.mathScope.addVariable(newName, this.value, onVariableChange);
    }
    setRawExpression(val){
        var expr = this.parseRawExpression(val);
        var localMathScope = Utility.deepCopyValuesOnly(this.math3d.mathScope);
        if (this.function){
            let argNames = this.argNames;
            this.value = function(){
                //arguments and this.argNames should have same length
                for (let j=0; j<arguments.length;j++){
                    localMathScope[argNames[j]] = arguments[j];
                }
                return expr.eval(localMathScope);
            }
        } 
        else {
            this.value = expr.eval(localMathScope);
        }
        this.math3d.mathScope[this.name] = this.value;
    }
}

class VariableSlider extends AbstractVariable {
    constructor(math3d, settings){
        super(math3d, settings);
        
        this.parsedMin = null;
        this.parsedMax = null;
        
        var _this = this;
        Object.defineProperties(this.settings,{
            min: {
                set: function(val){
                    this._min = val;
                    _this.setMin(val);
                },
                get: function(){return this._min;},
            },
            max: {
                set: function(val){
                    this._max = val;
                    _this.setMax(val);
                },
                get: function(){return this._max;},
            },
            value: {
                set: function(val){
                    this._value = val;
                    _this.setValue(val);
                },
                get: function(){return this._value;},
            }
        });
        
        this.settings = this.setDefaults(settings);
        var onVariableChange = math3d.onVariableChange.bind(math3d);
        math3d.mathScope.addVariable(this.settings.name, this.settings.value, onVariableChange);
        
    }
    
    get defaultSettings(){
        var defaults = {
            value:0.5,
            min:'0',
            max:'10',
            name: 'X'
        }
        return defaults
    }
    
    updateVariablesList(){
        this.variables = []
        if (this.parsedMin !== null){
            this.variables = this.variables.concat( this.parsedMin.variables );
            this.variables = this.variables.concat( this.parsedMin.functions );
        }
        if (this.parsedMax !== null){
            this.variables = this.variables.concat( this.parsedMax.variables );
            this.variables = this.variables.concat( this.parsedMax.functions );
        }
    }
    
    setMin(val){
        this.parsedMin = this.parseRawExpression(val);
        this.min = this.parsedMin.eval(this.math3d.mathScope);
        this.updateVariablesList();
    }
    setMax(val){
        this.parsedMax = this.parseRawExpression(val);
        this.max = this.parsedMax.eval(this.math3d.mathScope);
        this.updateVariablesList();
    }
    setValue(val){
        this.math3d.mathScope[this.name] = val;
    }
    
    addVarToMathScope(newName){
         var onVariableChange = this.math3d.onVariableChange.bind(this.math3d);
         return this.math3d.mathScope.addVariable(newName, this.settings.value, onVariableChange);
    }
    
}

// All classes below are used for rendering graphics with MathBox
class MathGraphic extends MathObject{
    constructor(math3d, settings){ 
        //Every sublcass should define these
        super(math3d, settings);
        this.mathboxGroup = null; 
        this.mathboxDataType = null; // e.g., 'array'
        this.mathboxRenderType = null; // e.g., 'point'
        
        this.parsedExpression = null;
        this.parsedRange = null;
        this.variables = [];
        
        this.settings = {};
        
        var _this = this;
        Object.defineProperties(this.settings,{
            rawExpression: {
                set: function(val){
                    this._rawExpression = val;
                    _this.parsedExpression = _this.parseRawExpression(val);
                    _this.updateVariablesList();
                    _this.recalculateData();
                },
                get: function(){return this._rawExpression;},
            },
            color: {
                set: function(val){
                    // test whether val is a valid hex color except for missing '#', e.g., 00FF2A. jscolor provides such colors.
                    var needsHash = /(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(val);
                    if (needsHash){val = "#" + val;}
                    this._color = val[0] === '#' ? val : Utility.namedColorToHexColor(val);
                    if (_this.mathboxGroup !== null){
                        _this.setColor(val);
                    }
                },
                get: function(){return this._color;},
            },
            shaded: {
                set: function(val){
                    this._shaded = val;
                    if (_this.mathboxGroup !== null){
                        _this.setShaded(val);
                    }
                },
                get: function(){return this._shaded;},
            },
            opacity: {
                set: function(val){
                    this._opacity = val;
                    if (_this.mathboxGroup !== null){
                        _this.setOpacity(val);
                    }
                },
                get: function(){return this._opacity;},
            },
            zIndex: {
                set: function(val){
                    this._zIndex = val;
                    if (_this.mathboxGroup !== null){
                        _this.setzIndex(val);
                    }
                },
                get: function(){return this._zIndex;},
            },
            visible: {
                set: function(val){
                    this._visible = val;
                    if (_this.mathboxGroup !== null){
                        _this.setVisible(val);
                    }
                },
                get: function(){return this._visible;},
            },
            size: {
                set: function(val){
                    this._size = val;
                    if (_this.mathboxGroup !== null){
                        _this.setSize(val);
                    }
                },
                get: function(){return this._size;},
            },
            width: {
                set: function(val){
                    this._width = val;
                    if (_this.mathboxGroup !== null){
                        _this.setWidth(val);
                    }
                },
                get: function(){return this._width;},
            },
            range: {
                set: function(val){
                    this._range = val;
                    _this.setRange(val);
                },
                get: function(){return this._range;},
            },
            samples: {
                set: function(val){
                    this._samples = val;
                    _this.setSamples(val);
                },
                get: function(){return this._samples;},
            },
        });
        
    };
    
    get defaultSettings(){
        var defaults = {
            visible: true,
            color: '#3090FF',
            zIndex: 0,
        }
        return defaults
    }
    
    static validateSettings(settings, scope){
        // I think this validation stuff was unncessary ...
        // Validate complete or partial settings.
        Utility.assert(typeof settings.visible === 'boolean' || typeof settings.visible === 'undefined')
        Utility.assert(typeof settings.zIndex === 'number' || typeof settings.zIndex === 'undefined')
        // warning: color check is not robust
        Utility.assert(typeof settings.color === 'string' || typeof settings.color === 'undefined')
    }
    
    updateVariablesList(){
        this.variables = []
        if (this.parsedExpression !== null){
            this.variables = this.variables.concat( this.parsedExpression.variables );
            this.variables = this.variables.concat( this.parsedExpression.functions );
        }
        
        if (this.parsedRange !== null){
            this.variables = this.variables.concat( this.parsedRange.variables );
            this.variables = this.variables.concat( this.parsedRange.functions );
        }
    }
    
    //Define this for every subclass
    recalculateData(){}
    
    get data() {return this._data;}
    set data(val) {
        this._data = val; 
        if (this.mathboxGroup !== null){
            this.setData(val);
        };
    }
    
    setData(val){
        this.mathboxGroup.select(this.mathboxDataType).set("data",val);
    }
    
    setColor(val){
        this.mathboxGroup.select(this.mathboxRenderType).set("color",val);
    }
    
    setShaded(val){
        this.mathboxGroup.select(this.mathboxRenderType).set("shaded",val);
    }
    
    setOpacity(val){
        this.mathboxGroup.select(this.mathboxRenderType).set("opacity",val);
    }
    
    setZIndex(val){
        this.mathboxGroup.select(this.mathboxRenderType).set("zIndex",val);
    }
    
    setSize(val){
        this.mathboxGroup.select(this.mathboxRenderType).set("size",val);
    }
    
    setVisible(val){
        this.mathboxGroup.select(this.mathboxRenderType).set("visible",val);
    }
    
    setWidth(val){
        this.mathboxGroup.select(this.mathboxRenderType).set("width",val);
    }
    
    setRange(val){
        this.parsedRange = this.parseRawExpression(val);
        this.range = this.parsedRange.eval(this.math3d.mathScope);
        this.updateVariablesList();
        this.recalculateData();
    }
    
    setSamples(val){
        this.recalculateData();
    }
    
    remove(){
        this.mathboxGroup.remove();
        MathObject.prototype.remove.call(this);
    }
}

class Point extends MathGraphic {
    constructor(math3d, settings){
        super(math3d, settings);
        this.mathboxDataType = 'array';
        this.mathboxRenderType = 'point';

        this.settings = this.setDefaults(settings);
        
        this.mathboxGroup = this.render();
    }
    
    get defaultSettings(){
        var defaults = _.merge(super.defaultSettings, {
            rawExpression: "[[0,0,0]]",
            size: 14,
        });
        return defaults
    }
    
    static validateSettings(settings, scope){
        // I think this validation stuff was unncessary ...
        super.validateSettings(settings, scope)
        Utility.assert(typeof settings.size === 'number' || typeof settings.size === 'undefined')
        
        // Now try to parse the raw expression. Should be an array [p1, p2, ...] where each p is a 3-component array
        if (settings.rawExpression !== undefined){
            var test = new MathExpression(settings.rawExpression)
            test.eval(scope).every( function(elem){return elem.length===3})
        }
    }
    
    recalculateData(){
        this.data = this.parsedExpression.eval(this.math3d.mathScope);
    }
    
    render(){
        var group = this.math3d.scene.group().set('classes', ['point']);
        
        var point = group.array({
            data: this.data,
            live:false,
            items: 1,
            channels: 3,
        }).swizzle({
          order: this.math3d.swizzleOrder
        }).point({
            color: this.settings.color,
            size: this.settings.size,
            visible: this.settings.visible,
            zIndex: this.settings.zIndex,
        });
        
        return group;
    }
    
}

class AbstractCurve extends MathGraphic {
    constructor(math3d, settings){
        super(math3d, settings);
        this.mathboxDataType = 'interval';
        this.mathboxRenderType = 'line';
        
    }
    
    get defaultSettings(){
        var defaults = _.merge(super.defaultSettings, {
            width: 4,
            start: false,
            end: false
        });
        return defaults
    }
}

class AbstractCurveFromData extends AbstractCurve {
    constructor(math3d, settings){
        super(math3d, settings);
        this.mathboxDataType = 'array';
    }
    
    recalculateData(){
        this.data = this.parsedExpression.eval(this.math3d.mathScope);
    }
    
    render(){
        var group = this.math3d.scene.group().set('classes', ['curve']);
        
        group.array({
            data: this.data,
            live:false,
            items: 1,
            channels: 3,
        }).swizzle({
          order: this.math3d.swizzleOrder
        }).line({
            color: this.settings.color,
            width: this.settings.width,
            visible: this.settings.visible,
            start: this.settings.start,
            end: this.settings.end,
            size: this.settings.size,
            zIndex: this.settings.zIndex
        });
        
        return group;
    }
}

class Line extends AbstractCurveFromData {
    constructor(math3d, settings){
        super(math3d, settings);

        this.settings = this.setDefaults(settings);
        
        this.mathboxGroup = this.render();
    }
    get defaultSettings(){
        var defaults = _.merge(super.defaultSettings, {
            rawExpression: "[[0,0,0],[pi,0,0],[pi,pi,0],[0,pi,0]]",
        });
        return defaults
    }
}

class Vector extends AbstractCurveFromData {
    constructor(math3d, settings){
        super(math3d, settings);
        
        this.settings = this.setDefaults(settings);
        
        this.mathboxGroup = this.render();
    }
    get defaultSettings(){
        var defaults = _.merge(super.defaultSettings, {
            rawExpression: "[[0,0,0],[pi,0,0],[pi,pi,0],[0,pi,0]]",
            end:true,
            size:6,
        });
        return defaults
    }
}

class ParametricCurve extends AbstractCurve{
    constructor(math3d, settings){
        super(math3d, settings);
        
        this.settings = this.setDefaults(settings);
        
        this.mathboxGroup = this.render();
    }
    get defaultSettings(){
        var defaults = _.merge(super.defaultSettings, {
            parameter: 't',
            rawExpression: "[cos(t),sin(t),t]",
            range: "[-2*pi,2*pi]",
            samples:64,
        });
        return defaults
    }
    
    recalculateData(){
        if (this.mathboxGroup !== null){
            this.mathboxGroup.select("cartesian").set("range",[this.range, [0,1]]);
            var expr = this.parsedExpression;
            var localMathScope = Utility.deepCopyValuesOnly(this.math3d.mathScope);
            var param = this.settings.parameter;
            
            this.range = this.parsedRange.eval(this.math3d.mathScope);
            this.mathboxGroup.select("cartesian").set("range",[this.range, [0,1]]);
            
            this.mathboxGroup.select("interval").set("expr", function (emit, t, i, j, time) {
                localMathScope[param] = t;
                var xyz = expr.eval(localMathScope);
                emit( ... xyz );
            } );
        }
        return
    }
    
    render(){
        // NOTE: Updating an <area>'s range does not work. However, it does work to make range a child of its own <cartesian>, inherit range from cartesian, and update <cartesian>'s range. See https://groups.google.com/forum/?fromgroups#!topic/mathbox/zLX6WJjTDZk
        var group = this.math3d.scene.group().set('classes', ['curve','parametric']);
        var expr = this.parsedExpression;
        var localMathScope = Utility.deepCopyValuesOnly(this.math3d.mathScope);
        var param = this.settings.parameter[0];
        
        var gridColor = Utility.defaultVal(this.settings.gridColor, Utility.lightenColor(this.settings.color,-0.5) );
        
        var data = group.cartesian({
            range: [this.range, [0,1]]
        }).interval({
            width:this.settings.samples,
            expr: function (emit, t, i, j, time) {
                localMathScope[param] = t;
                var xyz = expr.eval(localMathScope);
                emit( ... xyz );
            },
            channels:3,
            axis:1,
            live:false,
        }).swizzle({
            order: this.math3d.swizzleOrder
        });
        
        group.line({
            points: data,
            color: this.settings.color,
            opacity: this.settings.opacity,
            width: this.settings.width,
            visible: this.settings.visible,
            start: this.settings.start,
            end: this.settings.end,
            size: this.settings.size,
            zIndex: this.settings.zIndex
        });
        
        return group;
    }
    
}

class AbstractSurface extends MathGraphic {
    constructor(math3d, settings){
        super(math3d, settings);
        this.mathboxDataType = 'area';
        this.mathboxRenderType = 'surface';
    }
    get defaultSettings(){
        var defaults = _.merge(super.defaultSettings, {
            opacity: 0.66,
            gridX: 8,
            gridY: 8,
            gridOpacity:0.75,
            shaded:false
        });
        return defaults
    }
}

class ParametricSurface extends AbstractSurface {
    constructor(math3d, settings){
        super(math3d, settings);
           
        this.settings = this.setDefaults(settings);
        
        this.mathboxGroup = this.render();
    }

    get defaultSettings(){
        var defaults = _.merge(super.defaultSettings, {
            parameters: ['u','v'],
            rawExpression: "[v*cos(u),v*sin(u),v]",
            range: "[[-pi,pi],[-1,1]]",
            samples: [32,32],
        });
        return defaults
    }
    
    recalculateData(){
        if (this.mathboxGroup !== null){
            this.mathboxGroup.select("cartesian").set("range",this.range);

            var expr = this.parsedExpression;
            var localMathScope = Utility.deepCopyValuesOnly(this.math3d.mathScope);
            var param0 = this.settings.parameters[0];
            var param1 = this.settings.parameters[1];
            
            this.range = this.parsedRange.eval(this.math3d.mathScope);
            this.mathboxGroup.select("cartesian").set("range",this.range);
            this.mathboxGroup.select("area").set("expr", function (emit, u, v, i, j, time) {
                localMathScope[param0] = u;
                localMathScope[param1] = v;
                var xyz = expr.eval(localMathScope);
                emit( ... xyz );
            } );
        }
        return
    }
    
    render(){
        // NOTE: Updating an <area>'s range does not work. However, it does work to make range a child of its own <cartesian>, inherit range from cartesian, and update <cartesian>'s range. See https://groups.google.com/forum/?fromgroups#!topic/mathbox/zLX6WJjTDZk
        var group = this.math3d.scene.group().set('classes', ['surface','parametric']);
        var expr = this.parsedExpression;
        var localMathScope = Utility.deepCopyValuesOnly(this.math3d.mathScope);
        var param0 = this.settings.parameters[0];
        var param1 = this.settings.parameters[1];
        
        var gridColor = Utility.defaultVal(this.settings.gridColor, Utility.lightenColor(this.settings.color,-0.5) );
        
        var data = group.cartesian({
            range: this.range
        }).area({
            width:this.settings.samples[0],
            height:this.settings.samples[1],
            expr: function (emit, u, v, i, j, time) {
                localMathScope[param0] = u;
                localMathScope[param1] = v;
                var xyz = expr.eval(localMathScope);
                emit( ... xyz );
            },
            channels:3,
            axes:[1,2],
            live:false,
        }).swizzle({
            order: this.math3d.swizzleOrder
        })
        
        var surface = group.surface({
            points:data,
            color: this.settings.color,
            visible: this.settings.visible,
            opacity: this.settings.opacity,
            shaded: this.settings.shaded
        }).group()
            .resample({height:this.settings.gridY,source:data})
            .line({
                color:gridColor,
                opacity:this.settings.gridOpacity
            })
        .end()
        .group()
            .resample({width:this.settings.gridX, source:data,})
            .transpose({order:'yx'})
            .line({
                color:gridColor,
                opacity:this.settings.gridOpacity
            })
        .end();
        
        return group;
    }
    
}