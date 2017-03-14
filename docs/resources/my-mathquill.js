function texToMathJS(tex){
  expressions = [
    {tex:'\\left', math:''},
    {tex:'\\right', math:''},
    {tex:'{',math:'('},
    {tex:'}',math:')'},
    {tex:'\\ ',math:' '},
    {tex:'\\cos', math:'cos'},
    {tex:'\\sin', math:'sin'},
    {tex:'\\tan', math:'tan'},
    {tex:'\\sec', math:'tan'},
    {tex:'\\csc', math:'tan'},
    {tex:'\\cot', math:'tan'},
    {tex:'\\exp', math:'exp'},
    {tex:'\\ln', math:'ln'},
    {tex:'\\log', math:'log'},
    {tex:'\\sqrt', math:'sqrt'}
  ]
  
  for (j=0; j<expressions.length; j++){
    tex = Utility.replaceAll(tex, expressions[j]['tex'], expressions[j]['math'])
  }
  return tex;
}
MQ = MathQuill.getInterface(2)

function MyMathField(el, config){
    
    function onEdit(){
        console.log('edited');
    }
    
    defaultConfig = {
        handlers: {
            edit: function() {
                onEdit();
            }
        }
    }
    
    MQ.MathField(el, config)
}

MQ.MathField.prototype.mathjs = function (){
    // converts to a string mathjs can (hopefully) understand
    return texToMathJS(this.latex());
}