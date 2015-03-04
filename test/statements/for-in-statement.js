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

var testParse = require("../assertions").testParse;
var stmt = require("../helpers").stmt;

suite("Parser", function () {
  suite("for in statement", function () {

    testParse("for(x in list) process(x);", stmt,
      { type: "ForInStatement",
        body:
          { type: "ExpressionStatement",
            expression:
              { type: "CallExpression",
                callee: { type: "IdentifierExpression", name: "process" },
                arguments:
                  [ { type: "IdentifierExpression", name: "x" } ] } },
        left: { type: "IdentifierExpression", name: "x" },
        right: { type: "IdentifierExpression", name: "list" } }
    );

    testParse("for (var x in list) process(x);", stmt,
      new Shift.ForInStatement(
        new Shift.VariableDeclaration("var", [
          new Shift.VariableDeclarator({ type: "BindingIdentifier", name: "x" }, null)
        ]),
        { type: "IdentifierExpression", name: "list" },
        new Shift.ExpressionStatement(new Shift.CallExpression(
          { type: "IdentifierExpression", name: "process" },
          [{ type: "IdentifierExpression", name: "x" }]
        ))
      )
    );

    testParse("for (let x in list) process(x);", stmt,
      new Shift.ForInStatement(
        new Shift.VariableDeclaration("let", [
          new Shift.VariableDeclarator({ type: "BindingIdentifier", name: "x" }, null)
        ]),
        { type: "IdentifierExpression", name: "list" },
        new Shift.ExpressionStatement(new Shift.CallExpression(
          { type: "IdentifierExpression", name: "process" },
          [{ type: "IdentifierExpression", name: "x" }]
        ))
      )
    );

    testParse("for(var a in b);", stmt,
      new Shift.ForInStatement(
        new Shift.VariableDeclaration("var", [
          new Shift.VariableDeclarator({ type: "BindingIdentifier", name: "a" }, null)
        ]),
        { type: "IdentifierExpression", name: "b" },
        new Shift.EmptyStatement
      )
    );

    testParse("for(a in b);", stmt,
      { type: "ForInStatement",
        body: { type: "EmptyStatement" },
        left: { type: "IdentifierExpression", name: "a" },
        right: { type: "IdentifierExpression", name: "b" } }
    );

    // TODO: a should be a BindingIdentifier, not an IdentifierExpression
    testParse("for(a in b);", stmt,
      new Shift.ForInStatement(
        { type: "IdentifierExpression", name: "a" },
        { type: "IdentifierExpression", name: "b" },
        new Shift.EmptyStatement
      )
    );

    testParse("for(a.b in c);", stmt,
      new Shift.ForInStatement(
        new Shift.StaticMemberExpression({ type: "IdentifierExpression", name: "a" }, "b"),
        { type: "IdentifierExpression", name: "c" },
        new Shift.EmptyStatement
      )
    );
  });
});
