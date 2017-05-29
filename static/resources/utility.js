// MIT License
//
// Copyright (c) 2017 Christopher Chudzicki
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

'use strict';

class Utility {
    static defaultVal(variable, defaultVal) {
        return typeof variable !== 'undefined' ? variable : defaultVal;
    }

    static detectObjectDifferences(a, b) {
        // Returns keys that appear in the difference a - b
        // http://stackoverflow.com/a/31686152/2747370
        var diffKeys = _.reduce(a, function(result, value, key) {
            return _.isEqual(value, b[key]) ? result : result.concat(key);
        }, []);
        return diffKeys
    }

    static isPureObject(arg) {
        // Test if something is an object. 
        // OK, [1,2,3] is an object in JS. I mean test if something is an object like {a:1,b:[1,2,3],c:{aa:5}}.
        return arg !== null && typeof arg === 'object' && !Array.isArray(arg)
    }

    static deepObjectDiff(a, b) {
        var diff = {};
        var keys = Utility.detectObjectDifferences(a, b);
        for (var j = 0; j < keys.length; j++) {
            var key = keys[j];
            var aValue = a[key];
            var bValue = b[key];
            if (Utility.isPureObject(aValue) && Utility.isPureObject(bValue)) {
                diff[key] = Utility.deepObjectDiff(aValue, bValue);
            } else {
                diff[key] = aValue;
            }
        }
        return diff
    }

    static deepCopyValuesOnly(obj) {
        //Intended to help serialize objects with a getter named KEY that stores values in _KEY.
        // FIXME I'm not 100% sure this actually copies the object ... strings, numbers, arrays, will definitely be copied.
        var deepCopy = {};
        for (var key in obj) {
            if (key[0] == '_') {
                //In this case, the object should have a getter, but let's check
                var subkey = key.substring(1)
                if (obj[subkey] !== undefined && typeof Object.getOwnPropertyDescriptor(obj, subkey).get === 'function') {
                    key = subkey
                }
            }
            if (deepCopy.hasOwnProperty(key)) {
                throw `Error: Input Object has both ${key} and _${key} properties.`
            }

            if (Utility.isPureObject(obj[key])) {
                deepCopy[key] = Utility.deepCopyValuesOnly(obj[key]);
            } else if (Array.isArray(obj[key])) {
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
        if (query === "") {
            return query_string
        }
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    }

    static namedColorToHexColor(color) {
        color = color.toLowerCase();
        var namedColors = {
            aliceblue: '#F0F8FF',
            antiquewhite: '#FAEBD7',
            aqua: '#00FFFF',
            aquamarine: '#7FFFD4',
            azure: '#F0FFFF',
            beige: '#F5F5DC',
            bisque: '#FFE4C4',
            black: '#000000',
            blanchedalmond: '#FFEBCD',
            blue: '#0000FF',
            blueviolet: '#8A2BE2',
            brown: '#A52A2A',
            burlywood: '#DEB887',
            cadetblue: '#5F9EA0',
            chartreuse: '#7FFF00',
            chocolate: '#D2691E',
            coral: '#FF7F50',
            cornflowerblue: '#6495ED',
            cornsilk: '#FFF8DC',
            crimson: '#DC143C',
            cyan: '#00FFFF',
            darkblue: '#00008B',
            darkcyan: '#008B8B',
            darkgoldenrod: '#B8860B',
            darkgray: '#A9A9A9',
            darkgrey: '#A9A9A9',
            darkgreen: '#006400',
            darkkhaki: '#BDB76B',
            darkmagenta: '#8B008B',
            darkolivegreen: '#556B2F',
            darkorange: '#FF8C00',
            darkorchid: '#9932CC',
            darkred: '#8B0000',
            darksalmon: '#E9967A',
            darkseagreen: '#8FBC8F',
            darkslateblue: '#483D8B',
            darkslategray: '#2F4F4F',
            darkslategrey: '#2F4F4F',
            darkturquoise: '#00CED1',
            darkviolet: '#9400D3',
            deeppink: '#FF1493',
            deepskyblue: '#00BFFF',
            dimgray: '#696969',
            dimgrey: '#696969',
            dodgerblue: '#1E90FF',
            firebrick: '#B22222',
            floralwhite: '#FFFAF0',
            forestgreen: '#228B22',
            fuchsia: '#FF00FF',
            gainsboro: '#DCDCDC',
            ghostwhite: '#F8F8FF',
            gold: '#FFD700',
            goldenrod: '#DAA520',
            gray: '#808080',
            grey: '#808080',
            green: '#008000',
            greenyellow: '#ADFF2F',
            honeydew: '#F0FFF0',
            hotpink: '#FF69B4',
            indianred: '#CD5C5C',
            indigo: '#4B0082',
            ivory: '#FFFFF0',
            khaki: '#F0E68C',
            lavender: '#E6E6FA',
            lavenderblush: '#FFF0F5',
            lawngreen: '#7CFC00',
            lemonchiffon: '#FFFACD',
            lightblue: '#ADD8E6',
            lightcoral: '#F08080',
            lightcyan: '#E0FFFF',
            lightgoldenrodyellow: '#FAFAD2',
            lightgray: '#D3D3D3',
            lightgrey: '#D3D3D3',
            lightgreen: '#90EE90',
            lightpink: '#FFB6C1',
            lightsalmon: '#FFA07A',
            lightseagreen: '#20B2AA',
            lightskyblue: '#87CEFA',
            lightslategray: '#778899',
            lightslategrey: '#778899',
            lightsteelblue: '#B0C4DE',
            lightyellow: '#FFFFE0',
            lime: '#00FF00',
            limegreen: '#32CD32',
            linen: '#FAF0E6',
            magenta: '#FF00FF',
            maroon: '#800000',
            mediumaquamarine: '#66CDAA',
            mediumblue: '#0000CD',
            mediumorchid: '#BA55D3',
            mediumpurple: '#9370DB',
            mediumseagreen: '#3CB371',
            mediumslateblue: '#7B68EE',
            mediumspringgreen: '#00FA9A',
            mediumturquoise: '#48D1CC',
            mediumvioletred: '#C71585',
            midnightblue: '#191970',
            mintcream: '#F5FFFA',
            mistyrose: '#FFE4E1',
            moccasin: '#FFE4B5',
            navajowhite: '#FFDEAD',
            navy: '#000080',
            oldlace: '#FDF5E6',
            olive: '#808000',
            olivedrab: '#6B8E23',
            orange: '#FFA500',
            orangered: '#FF4500',
            orchid: '#DA70D6',
            palegoldenrod: '#EEE8AA',
            palegreen: '#98FB98',
            paleturquoise: '#AFEEEE',
            palevioletred: '#DB7093',
            papayawhip: '#FFEFD5',
            peachpuff: '#FFDAB9',
            peru: '#CD853F',
            pink: '#FFC0CB',
            plum: '#DDA0DD',
            powderblue: '#B0E0E6',
            purple: '#800080',
            rebeccapurple: '#663399',
            red: '#FF0000',
            rosybrown: '#BC8F8F',
            royalblue: '#4169E1',
            saddlebrown: '#8B4513',
            salmon: '#FA8072',
            sandybrown: '#F4A460',
            seagreen: '#2E8B57',
            seashell: '#FFF5EE',
            sienna: '#A0522D',
            silver: '#C0C0C0',
            skyblue: '#87CEEB',
            slateblue: '#6A5ACD',
            slategray: '#708090',
            slategrey: '#708090',
            snow: '#FFFAFA',
            springgreen: '#00FF7F',
            steelblue: '#4682B4',
            tan: '#D2B48C',
            teal: '#008080',
            thistle: '#D8BFD8',
            tomato: '#FF6347',
            turquoise: '#40E0D0',
            violet: '#EE82EE',
            wheat: '#F5DEB3',
            white: '#FFFFFF',
            whitesmoke: '#F5F5F5',
            yellow: '#FFFF00',
            yellowgreen: '#9ACD32'
        };
        return namedColors[color];
    }

    static lightenColor(color, amt) {
        //color should be hex or named. First get hex color if it is named
        if (color[0] != "#") {
            //http://www.w3schools.com/colors/colors_names.asp
            color = Utility.namedColorToHexColor(color);
        }

        if (color === undefined) {
            return false
        }

        //Now that we have hex, let's lighten it
        //http://stackoverflow.com/a/13532993/2747370
        var R = parseInt(color.substring(1, 3), 16),
            G = parseInt(color.substring(3, 5), 16),
            B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (1 + amt));
        G = parseInt(G * (1 + amt));
        B = parseInt(B * (1 + amt));

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
        var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
        var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    }

    static assert(condition, message) {
        if (!condition) {
            var message = Utility.defaultVal(message, "Assertion Failed");
            if (typeof Error !== "undefined") {
                throw new Error(message);
            }
            throw message; // Fallback
        }
    }
    
    static extendSetter(obj, prop, afterSet){
        // Original property must be configurable, which is not default
        // afterSet(val) ... val is value passed to original setter
        var originalSetter = Object.getOwnPropertyDescriptor(obj, prop).set;
        Object.defineProperty(obj, prop, {
            set: function(val){
                originalSetter.call(obj, val);
                afterSet.call(obj, val);
            }
        })
    }
    static extendGetter(obj, prop, afterGet){
        // Original property must be configurable, which is not default
        // afterGet(val) ... val is the value returned by original getter. afterGet should return the new get value.
        var originalGetter = Object.getOwnPropertyDescriptor(obj, prop).get;
        Object.defineProperty(obj, prop, {
            get: function(){
                var val = originalGetter.call(obj);
                return afterGet.call(obj, val);
            }
        })
    }
    
    //http://stackoverflow.com/a/1144788/2747370
    static escapeRegExp(str) {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }
    static replaceAll(str, find, replace) {
        return str.replace(new RegExp(Utility.escapeRegExp(find), 'g'), replace);
    }
    
    static findClosingBrace(string, startIdx){
        var braces = {
            '[':']',
            '<':'>',
            '(':')',
            '{':'}'
        };
        var openingBrace = string[startIdx];
        var closingBrace = braces[openingBrace];
        
        if (closingBrace===undefined){
            throw `${string} does not contain an opening brace at position ${startIdx}.`
        }
        
        var stack = 1;
        
        for (let j=startIdx+1; j<string.length; j++){
            if (string[j] === openingBrace){
                stack += +1;
            }
            else if (string[j]==closingBrace){
                stack += -1;
            }
            if (stack === 0){
                return j;
            }
        }

        if (stack !== 0 ){
            throw `${string} has a brace that opens at position ${startIdx} but does not close.`
        }
        
    }
}
