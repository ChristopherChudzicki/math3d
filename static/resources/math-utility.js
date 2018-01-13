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

class MathUtility {
    static diff(f, ...values) {
        // If only function "f" is provided, return a new function that approximates the derivative of f
        // If values are provided also, return the value of the derivative at those values;
        var eps = 0.008;
        var numberOfArguments = f.numberOfArguments ? f.numberOfArguments : f.length;
        var derivative = function() {
            var derivComponents = [];
            for (let j = 0; j < numberOfArguments; j++) {
                arguments[j] = Number(arguments[j]) // When used inside mathJS expressions, argument might be a string. So convert to a number first.
                arguments[j] += -0.5 * eps
                let initialValue = f(...arguments);
                arguments[j] += eps
                let finalValue = f(...arguments);
                arguments[j] += -0.5 * eps
                derivComponents.push(math.divide(math.subtract(finalValue, initialValue), eps))
            }
            if (derivComponents.length === 1) {
                return derivComponents[0]
            } else {
                return derivComponents
            }
        }

        if (values.length > 0) {
            return derivative(...values)
        } else {
            derivative.numberOfArguments = numberOfArguments;
            return derivative
        }
    }

    static normalize(array1d) {
        var norm = Math.sqrt( array1d.reduce( (acc, val) => acc+val*val, 0 ) );
        return array1d.map( x => x/norm );
    }
    static unitT(f, t) {
        t = Number(t);
        var eps = 0.008;
        return MathUtility.normalize(math.subtract(f(t+eps/2), f(t-eps/2)));
    }
    static unitN(f, t) {
        t = Number(t);
        var eps = 0.008;
        return MathUtility.normalize(math.subtract(MathUtility.unitT(f,t+eps/2), MathUtility.unitT(f,t-eps/2)));
    }
    static unitB(f, t){
        t = Number(t);
        var T = MathUtility.unitT(f,t);
        var N = MathUtility.unitN(f,t);

        return [ N[2]*T[1]-N[1]*T[2], N[0]*T[2]-N[2]*T[0], N[1]*T[0] - N[0]*T[1]  ]
    }

    static clamp(min, val, max) {
        return Math.min(Math.max(min, val), max)
    }

    // This is a parser for converting from mathquill's latex to expressions mathjs can parse.
    static texToMathJS(tex) {
        tex = fracToDivision(tex);

        var replacements = [
            {tex:'\\operatorname{diff}',math:'diff'},
            {tex:'\\operatorname{unitT}',math:'unitT'},
            {tex:'\\operatorname{unitN}',math:'unitN'},
            {tex:'\\operatorname{unitB}',math:'unitB'},
            {tex: '\\cdot', math: ' * '},
            {tex: '\\left', math: ''},
            {tex: '\\right',math: ''},
            {tex: '^{ }', math: ''}, // prevents mq cursor leaving supscripts**
            {tex: '/{ }', math: ''}, // prevents mq cursor leaving denoms**
            {tex: '{', math: '('},
            {tex: '}', math: ')'},
            {tex: '~', math:' '},
            {tex: '\\', math: ' '},
        ]
        //** I believe this works because it prevents ephemeral syntax errors in the mathjs parser. I think these syntax errors were messing witht he mathquill cursor. But I do not 100% understand why this worked.

        for (let j = 0; j < replacements.length; j++) {
            tex = Utility.replaceAll(tex, replacements[j]['tex'], replacements[j]['math'])
        }

        return tex;

        function fracToDivision(string){
            var frac = "\\frac",
            fracStart = string.indexOf(frac),
            numStart = fracStart + frac.length; // numerator start

            if (fracStart < 0) { return string;}

            var divIdx = Utility.findClosingBrace(string,numStart)

            // Remove frac, and add "/"
            string = string.slice(0,fracStart) + string.slice(numStart,divIdx+1) + "/" + string.slice(divIdx+1);

            // Test if any fracs remain
            fracStart = string.indexOf(frac)
            if (fracStart < 0){
                return string
            }
            else {
                return fracToDivision(string);
            }

            return string
        }
    }

    // A latex handle for mathjs that:
    // converts ArrayNode to [,,,] rather than \begin{array}...\end{array}
    // puts most function names and symbols in italic
    static toTexHandler(node, options){
        if (node.type === 'ArrayNode'){
            return arrayNodeHandler(node, options);
        }
        else if (node.type==='SymbolNode'){
            return symbolNodeHandler(node, options);
        }
        else if (node.type==='FunctionNode') {
            return functionNodeHandler(node, options);
        }
        else if (node.type==='OperatorNode'){
            return operatorNodeHandler(node, options);
        }
        else {
            return; //returning nothing falls back to default behavior
        }

        function arrayNodeHandler(node, options){
            var items = [];
            for (let j=0; j<node.items.length; j++){
                items.push(`\\ ${node.items[j].toTex(options)}`)
            }
            return replacements(`[${String(items)}]`);
        }
        function symbolNodeHandler(node, options){
            var toTex;
            var symbolNames = {
                pi: "\\pi",
                theta: "\\theta"
            }

            if (symbolNames[node.name] !== undefined){
                toTex = ` ${symbolNames[node.name]}`;
            }
            else {
                toTex = ` ${node.name} `;
            }
            return replacements(toTex);
        }
        function functionNodeHandler(node, options){
            var toTex;
            var funcNames = {
                sin: "\\sin",
                cos: "\\cos",
                tan: "\\tan",
                csc: "\\csc",
                sec: "\\sec",
                cot: "\\cot",
                asin: "\\asin",
                acos: "\\acos",
                atan: "\\atan",
                exp: "\\exp",
                log: "\\log",
                ln: "\\ln",
            }
            var args = argsHandler(node, options);
            if (node.name === "sqrt"){
                toTex = ` \\sqrt{ ${args} } `
            }
            else if (funcNames[node.name] !== undefined){
                toTex = ` ${node.name}\\left(${args}\\right) `;
            }
            else {
                toTex = ` ${node.name}\\left(${args}\\right) `;
            }

            return replacements(toTex);
        }
        function argsHandler(node, options){
            var args = [];
            for (let j = 0; j<node.args.length; j++){
                args.push(node.args[j].toTex(options));
            }
            return replacements(String(args));
        };
        function operatorNodeHandler(node, options){
            // adjust handling of exponentiation.
            // e^(-t) --> e^{-t} not e^{(-t)}.
            if (node.op === '^' && node.args[1].type === 'ParenthesisNode'){
                return `${node.args[0].toTex(options)}^{${node.args[1].content.toTex(options)}}`;
            }
            // adjust handling of fractions
            // e^((a+b)/(c+d)) --> e^{-\frac{a+b}{c+d}} not e^{-\frac{(a+b)}{(c+d)}}
            if (node.op === '/'){
              var numer = node.args[0]
              var denom = node.args[1]
              if (numer.type==='ParenthesisNode' && denom.type==='ParenthesisNode') {
                return `\\frac{${numer.content.toTex(options)}}{${denom.content.toTex(options)}}`
              }
              if (numer.type==='OperatorNode' && denom.type==='ParenthesisNode' && numer.args[0].type === 'ParenthesisNode') {
                return `-\\frac{${numer.args[0].content.toTex(options)}}{${denom.content.toTex(options)}}`
              }
            }
            else {
                return ;
            }
        }
        function replacements(toTex){
            var replacements = [
                {mathjs:'~', mathquill: ''},
            ]
            for (let j = 0; j < replacements.length; j++) {
                toTex = Utility.replaceAll(toTex, replacements[j]['mathjs'], replacements[j]['mathquill'])
            }
            return toTex;
        }
    }
}
