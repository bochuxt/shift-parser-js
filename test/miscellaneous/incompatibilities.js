/**
 * Copyright 2014 Shape Security, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Shift = require("shift-ast");

var expr = require("../helpers").expr;
var stmt = require("../helpers").stmt;
var testParse = require("../assertions").testParse;
var testParseFailure = require("../assertions").testParseFailure;
var testParseModule = require("../assertions").testParseModule;
var testParseModuleFailure = require("../assertions").testParseModuleFailure;

function moduleExpr(m) {
  return m.items[0].expression;
}

suite("Parser", function() {
  // programs that parse according to ES3 but either fail or parse differently according to ES5
  suite("ES5 backward incompatibilities", function() {
    // ES3: zero-width non-breaking space is allowed in an identifier
    // ES5: zero-width non-breaking space is a whitespace character
    testParseFailure("_\uFEFF_", "Unexpected identifier");

    // ES3: a slash in a regexp character class will terminate the regexp
    // ES5: a slash is allowed within a regexp character class
    testParseFailure("[/[/]", "Invalid regular expression: missing /");
  });

  // programs where we choose to diverge from the ES5 specification
  suite("ES5 divergences", function() {
    // ES5: assignment to computed member expression
    // ES6: variable declaration statement
    testParse("let[a] = b;", stmt,
      new Shift.VariableDeclarationStatement(new Shift.VariableDeclaration("let", [
        new Shift.VariableDeclarator(
          new Shift.ArrayBinding([{ type: "BindingIdentifier", name: "a" }], null),
          { type: "IdentifierExpression", name: "b" }
        ),
      ]))
    );
    testParse("const[a] = b;", stmt,
      new Shift.VariableDeclarationStatement(new Shift.VariableDeclaration("const", [
        new Shift.VariableDeclarator(
          new Shift.ArrayBinding([{ type: "BindingIdentifier", name: "a" }], null),
          { type: "IdentifierExpression", name: "b" }
        ),
      ]))
    );

    testParse("var let", stmt,
      new Shift.VariableDeclarationStatement(new Shift.VariableDeclaration("var", [
        new Shift.VariableDeclarator({ type: "BindingIdentifier", name: "let" }, null)
      ])));

    testParseFailure("'use strict'; var let", "Unexpected token let");
    testParseFailure("var const", "Unexpected token const");

    // ES5: invalid program
    // ES6: function declaration within a block
    testParse("{ function f(){} }", stmt,
      new Shift.BlockStatement(new Shift.Block([
        new Shift.FunctionDeclaration(false, { type: "BindingIdentifier", name: "f" }, [], null, new Shift.FunctionBody([], []))
      ]))
    );
  });

  // programs that parse according to ES5 but either fail or parse differently according to ES6
  suite("ES6 backward incompatibilities", function() {
    // ES5: in sloppy mode, future reserved words (including yield) are regular identifiers
    // ES6: yield has been moved from the future reserved words list to the keywords list
    testParse("var yield = function yield(){};", stmt,
      new Shift.VariableDeclarationStatement(new Shift.VariableDeclaration("var", [
        new Shift.VariableDeclarator(
          { type: "BindingIdentifier", name: "yield" },
          new Shift.FunctionExpression(false, { type: "BindingIdentifier", name: "yield" }, [], null, new Shift.FunctionBody([], []))
        )
      ]))
    );

    // ES5: this declares a function-scoped variable while at the same time assigning to the block-scoped variable
    // ES6: this particular construction is explicitly disallowed
    testParse("try {} catch(e) { var e = 0; }", stmt,
      new Shift.TryCatchStatement(
        new Shift.Block([]),
        new Shift.CatchClause(
          { type: "BindingIdentifier", name: "e" },
          new Shift.Block([
            new Shift.VariableDeclarationStatement(new Shift.VariableDeclaration("var", [
              new Shift.VariableDeclarator({ type: "BindingIdentifier", name: "e" }, new Shift.LiteralNumericExpression(0))
            ]))
          ])
        )
      )
    );

    // ES5: allows any LeftHandSideExpression on the left of an assignment
    // ES6: allows only valid bindings on the left of an assignment
    testParseFailure("a+b=c", "Invalid left-hand side in assignment");
    testParseFailure("+i = 0", "Invalid left-hand side in assignment");
    testParseFailure("new a=b", "Invalid left-hand side in assignment");
    testParseFailure("(a+b)=c", "Invalid left-hand side in assignment");
    testParseFailure("f()++", "Invalid left-hand side in assignment");
    testParseFailure("--f()", "Invalid left-hand side in assignment");

    // ES5: allows initializers in for-in and for-of head
    // ES6: disallows initializers in for-in and for-of head
    testParseFailure("for(var x=1 in [1,2,3]) 0", "Invalid variable declaration in for-in statement");
    testParseFailure("for(let x=1 in [1,2,3]) 0", "Invalid variable declaration in for-in statement");
    testParseFailure("for(var x=1 of [1,2,3]) 0", "Invalid variable declaration in for-of statement");
    testParseFailure("for(let x=1 of [1,2,3]) 0", "Invalid variable declaration in for-of statement");

    testParse("for(var x in [1,2]) 0", stmt, new Shift.ForInStatement(
      new Shift.VariableDeclaration("var", [new Shift.VariableDeclarator({ type: "BindingIdentifier", name: "x" }, null)]),
      new Shift.ArrayExpression([new Shift.LiteralNumericExpression(1), new Shift.LiteralNumericExpression(2)]),
      new Shift.ExpressionStatement(new Shift.LiteralNumericExpression(0))));
    testParse("for(let x in [1,2]) 0", stmt, new Shift.ForInStatement(
      new Shift.VariableDeclaration("let", [new Shift.VariableDeclarator({ type: "BindingIdentifier", name: "x" }, null)]),
      new Shift.ArrayExpression([new Shift.LiteralNumericExpression(1), new Shift.LiteralNumericExpression(2)]),
      new Shift.ExpressionStatement(new Shift.LiteralNumericExpression(0))));
    testParse("for(var x of [1,2]) 0", stmt, new Shift.ForOfStatement(
      new Shift.VariableDeclaration("var", [new Shift.VariableDeclarator({ type: "BindingIdentifier", name: "x" }, null)]),
      new Shift.ArrayExpression([new Shift.LiteralNumericExpression(1), new Shift.LiteralNumericExpression(2)]),
      new Shift.ExpressionStatement(new Shift.LiteralNumericExpression(0))));
    testParse("for(let x of [1,2]) 0", stmt, new Shift.ForOfStatement(
      new Shift.VariableDeclaration("let", [new Shift.VariableDeclarator({ type: "BindingIdentifier", name: "x" }, null)]),
      new Shift.ArrayExpression([new Shift.LiteralNumericExpression(1), new Shift.LiteralNumericExpression(2)]),
      new Shift.ExpressionStatement(new Shift.LiteralNumericExpression(0))));

    // ES5: allows unicode escape sequences in regular expression flags
    // ES6: disallowes unicode escape sequences in regular expression flags
    testParseFailure("/a/\\u0000", "Invalid regular expression");


    // ES5: disallow HTML-like comment
    // ES6: allowed in Script.
    testParse("<!--", stmt, undefined);
    testParse("-->", stmt, undefined);
    testParseFailure("a -->", "Unexpected end of input");
    testParseFailure(";/**/-->", "Unexpected token >");
    testParse("\n  -->", stmt, undefined);
    testParse("/*\n*/-->", stmt, undefined);
    testParse("a<!--b", expr, { type: "IdentifierExpression", name: "a" });

    testParseModuleFailure("<!--", "Unexpected token <");
    testParseModuleFailure("-->", "Unexpected token >");

    testParseModule("a<!--b", moduleExpr,
      new Shift.BinaryExpression("<",
        { type: "IdentifierExpression", name: "a" },
        new Shift.PrefixExpression("!",
          new Shift.PrefixExpression("--",
            { type: "IdentifierExpression", name: "b" }
          )
        )
      )
    );

  });
});
