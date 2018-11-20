import $ from 'jquery';
import {parseCode, parsing} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        let array = parsing(parsedCode);
        $('#tableBody').empty();
        for (let i = 0; i < array.length; i++) {
            let item = array[i];
            let row = `<tr><td>${item.line}</td><td>${item.type}</td>
                        <td>${item.name}</td><td>${item.condition}</td><td>${item.value}</td></tr>`;
            $('#tableBody').append(row);
        }
    });
});

/*
function parseSingle (arrayRows, item, countRow){
    if (item.type === "VariableDeclaration")
        parseVariable (item, countRow, arrayRows);
    else if (item.type === "ExpressionStatement")
        arrayRows.push(parseAssignment(item, countRow));
    else if (item.type === "IfStatement"){
        arrayRows.push(parseIf(item, countRow));
        if (item.consequent.type !== "BlockStatement")
            countRow = parseSingle(arrayRows, item.consequent, countRow) + 1;
        else if (item.consequent.body !== [])
            countRow = parsingRec (arrayRows, item.consequent.body, countRow) + 1;
        if (item.alternate !== null){
            if (item.alternate.type !== "BlockStatement")
                countRow = parseSingle(arrayRows, item.alternate, countRow) + 1;
            else if (item.alternate.body !== [])
                countRow = parsingRec (arrayRows, item.alternate.body, countRow) + 1;
        }
    }
    else if (item.type === "WhileStatement"){
        arrayRows.push(parseWhile(item, countRow));
        if (item.body.type !== "BlockStatement")
            countRow = parseSingle(arrayRows, item.body, countRow) + 1;
        else if (item.body.body !== [])
            countRow = parsingRec (arrayRows, item.body.body, countRow) + 1;
    }
    else if (item.type === "ForStatement"){
        arrayRows.push(parseFor(item, countRow));
        if (item.body.type !== "BlockStatement")
            countRow = parseSingle(arrayRows, item.body, countRow) + 1;
        else if (item.body.body !== [])
            countRow = parsingRec (arrayRows, item.body.body, countRow) + 1;
    }
    else if (item.type === "FunctionDeclaration"){
        arrayRows = parseFunction(item, countRow, arrayRows);
        if (item.body.body !== [])
            countRow = parsingRec (arrayRows, item.body.body, countRow) + 1;
    }
    else if (item.type === "ReturnStatement"){
        arrayRows.push(parseReturn(item, countRow));
        return countRow;
    }
    return countRow;
}*/