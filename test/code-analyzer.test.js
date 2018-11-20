import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {parsing} from '../src/js/code-analyzer';
describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script"}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });

    it('1. variable declaration', () => {
        assert.deepEqual(
            parsing (parseCode('let a, b;')),
            [{'line': 1, 'type': 'variable declaration', 'name': 'a', 'condition': '', 'value': ''},
                {'line': 1, 'type': 'variable declaration', 'name': 'b', 'condition': '', 'value': ''}]
        );
    });

    it('2. variable declaration and assignment', () => {
        assert.deepEqual(
            parsing (parseCode('let a = 1, b = 2;')),
            [{'line': 1, 'type': 'variable declaration', 'name': 'a', 'condition': '', 'value': ''},
                {'line': 1, 'type': 'assignment expression', 'name': 'a', 'condition': '', 'value': 1},
                {'line': 1, 'type': 'variable declaration', 'name': 'b', 'condition': '', 'value': ''},
                {'line': 1, 'type': 'assignment expression', 'name': 'b', 'condition': '', 'value': 2}]
        );
    });

    it('3. variable assignment with binary expression', () => {
        assert.deepEqual(
            parsing (parseCode('a = b + 1;')),
            [{'line': 1, 'type': 'assignment expression', 'name': 'a', 'condition': '', 'value': 'b + 1'}]
        );
    });

    it('4. variable assignment with call expression', () => {
        assert.deepEqual(
            parsing (parseCode('a = foo (c, d+2);')),
            [{'line': 1, 'type': 'assignment expression', 'name': 'a', 'condition': '', 'value': 'foo (c, d + 2)'}]
        );
    });

    it('5. variable assignment with member expression', () => {
        assert.deepEqual(
            parsing (parseCode('a = x[b];')),
            [{'line': 1, 'type': 'assignment expression', 'name': 'a', 'condition': '', 'value': 'x[b]'}]
        );
    });

    it('6. variable assignment with update expression', () => {
        assert.deepEqual(
            parsing (parseCode('a++;')),
            [{'line': 1, 'type': 'assignment expression', 'name': 'a', 'condition': '', 'value': 'a++'}]
        );
    });

    it('7. if and else statement without block', () => {
        assert.deepEqual(
            parsing (parseCode('if (a>0)\n' +
                'a++;\n' +
                'else\n' +
                'b++;')),
            [{'line': 1, 'type': 'if statement', 'name': '', 'condition': 'a > 0', 'value': ''},
                {'line': 2, 'type': 'assignment expression', 'name': 'a', 'condition': '', 'value': 'a++'},
                {'line': 4, 'type': 'assignment expression', 'name': 'b', 'condition': '', 'value': 'b++'}]
        );
    });

    it('8. if and else statement with block', () => {
        assert.deepEqual(
            parsing (parseCode('if (a>0){\n' +
                'a++;\n' +
                '}\n' +
                'else{\n' +
                'b++;\n' +
                '}')),
            [{'line': 1, 'type': 'if statement', 'name': '', 'condition': 'a > 0', 'value': ''},
                {'line': 2, 'type': 'assignment expression', 'name': 'a', 'condition': '', 'value': 'a++'},
                {'line': 5, 'type': 'assignment expression', 'name': 'b', 'condition': '', 'value': 'b++'}]
        );
    });

    it('9. if and else if statement with block', () => {
        assert.deepEqual(
            parsing (parseCode('if (a>0){\n' +
                'a++;\n' +
                '}\n' +
                'else if (b>0){\n' +
                'b = b + 1;\n' +
                '}\n' +
                'else{\n' +
                'c++;\n' +
                '}')),
            [{'line': 1, 'type': 'if statement', 'name': '', 'condition': 'a > 0', 'value': ''},
                {'line': 2, 'type': 'assignment expression', 'name': 'a', 'condition': '', 'value': 'a++'},
                {'line': 4, 'type': 'else if statement', 'name': '', 'condition': 'b > 0', 'value': ''},
                {'line': 5, 'type': 'assignment expression', 'name': 'b', 'condition': '', 'value': 'b + 1'},
                {'line': 8, 'type': 'assignment expression', 'name': 'c', 'condition': '', 'value': 'c++'}]
        );
    });

    it('10. while statement without block', () => {
        assert.deepEqual(
            parsing (parseCode('while (a<=0)\n' +
                'b = c+2;')),
            [{'line': 1, 'type': 'while statement', 'name': '', 'condition': 'a <= 0', 'value': ''},
                {'line': 2, 'type': 'assignment expression', 'name': 'b', 'condition': '', 'value': 'c + 2'}]
        );
    });

    it('11. while statement with block and extra code after', () => {
        assert.deepEqual(
            parsing (parseCode('while (a<=0){\n' +
                'let b;\n' +
                'b = c+2;\n' +
                '}\n' +
                'a++;')),
            [{'line': 1, 'type': 'while statement', 'name': '', 'condition': 'a <= 0', 'value': ''},
                {'line': 2, 'type': 'variable declaration', 'name': 'b', 'condition': '', 'value': ''},
                {'line': 3, 'type': 'assignment expression', 'name': 'b', 'condition': '', 'value': 'c + 2'},
                {'line': 5, 'type': 'assignment expression', 'name': 'a', 'condition': '', 'value': 'a++'}]
        );
    });

    it('12. for statement without block', () => {
        assert.deepEqual(
            parsing (parseCode('for (i=0; i<=n; i--)\n' +
                'a = b;')),
            [{'line': 1, 'type': 'for statement', 'name': '', 'condition': 'i = 0; i <= n; i--', 'value': ''},
                {'line': 2, 'type': 'assignment expression', 'name': 'a', 'condition': '', 'value': 'b'}]
        );
    });

    it('13. for statement with block and if inside', () => {
        assert.deepEqual(
            parsing (parseCode('for (i=0; i<=n; i--){\n' +
                'if (i === 4)\n' +
                'a = b;\n' +
                '}')),
            [{'line': 1, 'type': 'for statement', 'name': '', 'condition': 'i = 0; i <= n; i--', 'value': ''},
                {'line': 2, 'type': 'if statement', 'name': '', 'condition': 'i === 4', 'value': ''},
                {'line': 3, 'type': 'assignment expression', 'name': 'a', 'condition': '', 'value': 'b'}]
        );
    });

    it('14. function declaration without return', () => {
        assert.deepEqual(
            parsing (parseCode('function foo (x, y){\n' +
                'a = y;\n' +
                '}')),
            [{'line': 1, 'type': 'function declaration', 'name': 'foo', 'condition': '', 'value': ''},
                {'line': 1, 'type': 'variable declaration', 'name': 'x', 'condition': '', 'value': ''},
                {'line': 1, 'type': 'variable declaration', 'name': 'y', 'condition': '', 'value': ''},
                {'line': 2, 'type': 'assignment expression', 'name': 'a', 'condition': '', 'value': 'y'}]
        );
    });

    it('15. function declaration with return', () => {
        assert.deepEqual(
            parsing (parseCode('function goo (a, b){\n' +
                'let c = 0;\n' +
                'if (a > 0)\n' +
                'c--;\n' +
                'return c;\n' +
                '}')),
            [{'line': 1, 'type': 'function declaration', 'name': 'goo', 'condition': '', 'value': ''},
                {'line': 1, 'type': 'variable declaration', 'name': 'a', 'condition': '', 'value': ''},
                {'line': 1, 'type': 'variable declaration', 'name': 'b', 'condition': '', 'value': ''},
                {'line': 2, 'type': 'variable declaration', 'name': 'c', 'condition': '', 'value': ''},
                {'line': 2, 'type': 'assignment expression', 'name': 'c', 'condition': '', 'value': '0'},
                {'line': 3, 'type': 'if statement', 'name': '', 'condition': 'a > 0', 'value': ''},
                {'line': 4, 'type': 'assignment expression', 'name': 'c', 'condition': '', 'value': 'c--'},
                {'line': 5, 'type': 'return statement', 'name': '', 'condition': '', 'value': 'c'}]
        );
    });

    it('16. function declaration with return and for', () => {
        assert.deepEqual(
            parsing (parseCode('function hoo (a, b, c){\n' +
                'let d=a-c;\n' +
                'for (let i=0; i<=b; i++){\n' +
                'if (d<b)\n' +
                'return a;\n' +
                'else if (d>=b)\n' +
                'return b;\n' +
                'else\n' +
                'return c;\n' +
                '}\n' +
                'return -1;\n' +
                '}')),
            [{'line': 1, 'type': 'function declaration', 'name': 'hoo', 'condition': '', 'value': ''},
                {'line': 1, 'type': 'variable declaration', 'name': 'a', 'condition': '', 'value': ''},
                {'line': 1, 'type': 'variable declaration', 'name': 'b', 'condition': '', 'value': ''},
                {'line': 1, 'type': 'variable declaration', 'name': 'c', 'condition': '', 'value': ''},
                {'line': 2, 'type': 'variable declaration', 'name': 'd', 'condition': '', 'value': ''},
                {'line': 2, 'type': 'assignment expression', 'name': 'd', 'condition': '', 'value': 'a - c'},
                {'line': 3, 'type': 'for statement', 'name': '', 'condition': 'i=0; i <= b; i++', 'value': ''},
                {'line': 4, 'type': 'if statement', 'name': '', 'condition': 'd < b', 'value': ''},
                {'line': 5, 'type': 'return statement', 'name': '', 'condition': '', 'value': 'a'},
                {'line': 6, 'type': 'else if statement', 'name': '', 'condition': 'd >= b', 'value': ''},
                {'line': 7, 'type': 'return statement', 'name': '', 'condition': '', 'value': 'b'},
                {'line': 9, 'type': 'return statement', 'name': '', 'condition': '', 'value': 'c'},
                {'line': 11, 'type': 'return statement', 'name': '', 'condition': '', 'value': '-1'}]
        );
    });

    it('17. if and else if statement', () => {
        assert.deepEqual(
            parsing (parseCode('if (a>0)\n' +
                'a++;\n' +
                'else if (b>0)\n' +
                'b++;\n' +
                'else if (c>0)\n' +
                'c++;\n' +
                'else\n' +
                'd++;')),
            [{'line': 1, 'type': 'if statement', 'name': '', 'condition': 'a > 0', 'value': ''},
                {'line': 2, 'type': 'assignment expression', 'name': 'a', 'condition': '', 'value': 'a++'},
                {'line': 3, 'type': 'else if statement', 'name': '', 'condition': 'b > 0', 'value': ''},
                {'line': 4, 'type': 'assignment expression', 'name': 'b', 'condition': '', 'value': 'b++'},
                {'line': 5, 'type': 'else if statement', 'name': '', 'condition': 'c > 0', 'value': ''},
                {'line': 6, 'type': 'assignment expression', 'name': 'c', 'condition': '', 'value': 'c++'},
                {'line': 8, 'type': 'assignment expression', 'name': 'd', 'condition': '', 'value': 'd++'}]
        );
    });

    it('18. function declaration with return', () => {
        assert.deepEqual(
            parsing (parseCode('function f(){\n' +
                'return;\n' +
                '}')),
            [{'line': 1, 'type': 'function declaration', 'name': 'f', 'condition': '', 'value': ''},
                {'line': 2, 'type': 'return statement', 'name': '', 'condition': '', 'value': ''}]
        );
    });

    it('19. if and else if statement', () => {
        assert.deepEqual(
            parsing (parseCode('if (a>0)\n' +
                'a++;\n' +
                'else if (b>0)\n' +
                'b++;')),
            [{'line': 1, 'type': 'if statement', 'name': '', 'condition': 'a > 0', 'value': ''},
                {'line': 2, 'type': 'assignment expression', 'name': 'a', 'condition': '', 'value': 'a++'},
                {'line': 3, 'type': 'else if statement', 'name': '', 'condition': 'b > 0', 'value': ''},
                {'line': 4, 'type': 'assignment expression', 'name': 'b', 'condition': '', 'value': 'b++'}]
        );
    });
});

