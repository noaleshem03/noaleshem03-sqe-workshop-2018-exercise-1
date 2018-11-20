import * as esprima from 'esprima';
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

export {parseCode};

function parsing (codeToParse){
    let arrayRows = [];
    let body = codeToParse.body;
    let countRow = 0;
    parsingRec(arrayRows, body, countRow);
    return arrayRows;
}
function parsingRec (arrayRows, body, countRow){
    for (let i=0; i<body.length; i++){
        countRow++;
        countRow = parseSingle(arrayRows, body[i], countRow);
    }
    return countRow;
}
function parseSingle (arrayRows, item, countRow){
    if (item.type === 'VariableDeclaration')
        countRow = parseVariable (item, countRow, arrayRows);
    else if (item.type === 'ExpressionStatement')
        countRow = parseAssignment(item, countRow, arrayRows);
    else if (item.type === 'IfStatement')
        countRow = parseIf(arrayRows, item, countRow);
    else if (item.type === 'WhileStatement')
        countRow = parseWhile(arrayRows, item, countRow);
    else
        countRow = parseSingleCon(arrayRows, item, countRow);
    return countRow;
}

function parseSingleCon(arrayRows, item, countRow){
    if (item.type === 'ReturnStatement')
        arrayRows.push(parseReturn(item, countRow));
    else if (item.type === 'ForStatement')
        countRow = parseFor (arrayRows, item, countRow);
    else /*if (item.type === 'FunctionDeclaration')*/
        countRow = parseFunction(item, countRow, arrayRows);
    return countRow;
}

function parseBlock(arrayRows, item, countRow){
    if (item.type === 'BlockStatement')
        countRow = parsingRec(arrayRows, item.body, countRow) + 1;
    else
        countRow = parseSingle(arrayRows, item, countRow+1);
    return countRow;
}

function parseVariable (item, lineNum, arrayRows){
    for (let j=0; j<item.declarations.length; j++){
        arrayRows.push(parseVariableTemp(item.declarations[j], lineNum));
        if (item.declarations[j].init !== null)
            arrayRows.push(parseAssignmentTemp(item.declarations[j], lineNum));
    }
    return lineNum;
}

function parseVariableTemp(item, lineNum){
    let l = lineNum;
    let t = 'variable declaration';
    let n = '';
    if (item.type === 'VariableDeclarator')
        n = parseExpression(item.id);
    else n = parseExpression(item);
    let c = '';
    let v = '';
    return {line: l, type: t, name: n, condition: c, value: v};
}

function parseAssignment(item, lineNum, arrayRows){
    arrayRows.push(parseAssignmentTemp(item.expression, lineNum));
    return lineNum;
}

function parseAssignmentTemp(item, lineNum){
    let l = lineNum;
    let t = 'assignment expression';
    let n='', v='';
    if (item.type === 'VariableDeclarator'){
        n = parseExpression(item.id);
        v = parseExpression(item.init);
    }
    else if (item.type === 'AssignmentExpression'){
        n = parseExpression(item.left);
        v = parseExpression(item.right);
    }
    else{ /*if (item.type === 'UpdateExpression'){*/
        n = parseExpression(item.argument);
        v = n + item.operator;
    }
    let c = '';
    return {line: l, type: t, name: n, condition: c, value: v};
}

function parseIf(arrayRows, item, countRow){
    arrayRows.push(parseIfTemp(item, countRow));
    countRow = parseBlock(arrayRows, item.consequent, countRow);
    if (item.alternate !== null){
        if (item.alternate.type === 'IfStatement')
            countRow = parseElseIf(arrayRows, item.alternate, countRow+1);
        else countRow = parseBlock(arrayRows, item.alternate, countRow+1);
    }
    return countRow;
}

function parseIfTemp (item, lineNum){
    let l = lineNum;
    let t = 'if statement';
    let n = '';
    let c = parseExpression(item.test);
    let v = '';
    return {line: l, type: t, name: n, condition: c, value: v};
}

function parseElseIf(arrayRows, item, countRow){
    arrayRows.push(parseElseIfTemp(item, countRow));
    countRow = parseBlock(arrayRows, item.consequent, countRow);
    if (item.alternate !== null){
        if (item.alternate.type === 'IfStatement')
            countRow = parseElseIf(arrayRows, item.alternate, countRow+1);
        else countRow = parseBlock(arrayRows, item.alternate, countRow+1);
    }
    return countRow;
}

function parseElseIfTemp (item, lineNum){
    let l = lineNum;
    let t = 'else if statement';
    let n = '';
    let c = parseExpression(item.test);
    let v = '';
    return {line: l, type: t, name: n, condition: c, value: v};
}

function parseWhile (arrayRows, item, countRow){
    arrayRows.push(parseWhileTemp(item, countRow));
    countRow = parseBlock(arrayRows, item.body, countRow);
    return countRow;
}

function parseWhileTemp (item, lineNum){
    let l = lineNum;
    let t = 'while statement';
    let n = '';
    let c = parseExpression(item.test);
    let v = '';
    return {line: l, type: t, name: n, condition: c, value: v};
}

function parseFor (arrayRows, item, countRow){
    arrayRows.push(parseForTemp(item, countRow));
    countRow = parseBlock(arrayRows, item.body, countRow);
    return countRow;
}

function parseForTemp (item, lineNum){
    let l = lineNum;
    let t = 'for statement';
    let n = '';
    let c = '';
    if (item.init.type === 'VariableDeclaration')
        c += item.init.declarations[0].id.name + '=' + item.init.declarations[0].init.value + '; ';
    else /*if (item.init.type === 'AssignmentExpression')*/
        c += parseExpression(item.init) + '; ';
    c += parseExpression(item.test) + '; ';
    c += item.update.argument.name + item.update.operator;
    let v = '';
    return {line: l, type: t, name: n, condition: c, value: v};
}

function parseFunction(item, countRow, arrayRows){
    arrayRows.push(parseFunctionTemp(item, countRow));
    for (let i=0; i<item.params.length; i++){
        arrayRows.push(parseVariableTemp(item.params[i], countRow));
    }
    countRow = parsingRec (arrayRows, item.body.body, countRow) + 1;
    return countRow;
}

function parseFunctionTemp(item, lineNum){
    let l = lineNum;
    let t = 'function declaration';
    let n = parseExpression(item.id);
    let c = '';
    let v = '';
    return {line: l, type: t, name: n, condition: c, value: v};
}

function parseReturn(item, lineNum){
    let l = lineNum;
    let t = 'return statement';
    let n = '';
    let c = '';
    let v = parseExpression(item.argument);
    return {line: l, type: t, name: n, condition: c, value: v};
}

function parseExpression(item){
    let v;
    if (item === null)
        v = '';
    else if (item.type === 'Literal')
        v = item.value;
    else if (item.type === 'Identifier')
        v = item.name;
    else if (item.type === 'UnaryExpression')
        v = item.operator + parseExpression(item.argument);
    else
        v = parseExpressionCon(item);
    return v;
}

function parseExpressionCon(item){
    let v;
    if (item.type === 'BinaryExpression' || item.type === 'AssignmentExpression')
        v = parseExpression(item.left) + ' ' + item.operator + ' ' + parseExpression(item.right);
    else if (item.type === 'MemberExpression')
        v = parseExpression(item.object) + '[' + parseExpression(item.property) + ']';
    else /*if (item.type === 'CallExpression')*/
        v = parseCallExpression(item);
    return v;
}

function parseCallExpression (item){
    let v;
    v = item.callee.name + ' (';
    let param = item.arguments;
    for (let i=0; i<param.length; i++){
        if (i === param.length-1) v = v + parseExpression(param[i]);
        else v = v + parseExpression(param[i]) + ', ';
    }
    v = v + ')';
    return v;
}

export {parsing};



