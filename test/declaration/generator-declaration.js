/**
 * Copyright 2015 Shape Security, Inc.
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
var testParseFailure = require("../assertions").testParseFailure;
var stmt = require("../helpers").stmt;

function id(x) {
  return x;
}

suite("Parser", function () {
  var emptyBody = new Shift.FunctionBody([], []);
  suite("generator declaration", function () {
    testParse("function* a(){}", stmt, new Shift.FunctionDeclaration(true, { type: "BindingIdentifier", name: "a" }, [], null, emptyBody));
    testParse("function* a(){yield}", stmt,
      new Shift.FunctionDeclaration(true, { type: "BindingIdentifier", name: "a" }, [], null, new Shift.FunctionBody([], [
        new Shift.ExpressionStatement(new Shift.YieldExpression(null))
      ])));
    testParse("function* a(){yield a}", stmt,
      new Shift.FunctionDeclaration(true, { type: "BindingIdentifier", name: "a" }, [], null, new Shift.FunctionBody([], [
        new Shift.ExpressionStatement(new Shift.YieldExpression({ type: "IdentifierExpression", name: "a" }))
      ])));
    testParse("function* yield(){}", stmt,
      new Shift.FunctionDeclaration(true, { type: "BindingIdentifier", name: "yield" }, [], null, emptyBody));

    testParse("function* a(a=yield){}", stmt,
      new Shift.FunctionDeclaration(
        true,
        { type: "BindingIdentifier", name: "a" },
        [new Shift.BindingWithDefault({ type: "BindingIdentifier", name: "a" }, { type: "IdentifierExpression", name: "yield" })],
        null,
        emptyBody));

    testParse("function* a({[yield]:a}){}", stmt,
      new Shift.FunctionDeclaration(
        true,
        { type: "BindingIdentifier", name: "a" },
        [new Shift.ObjectBinding([
          new Shift.BindingPropertyProperty(
            new Shift.ComputedPropertyName({ type: "IdentifierExpression", name: "yield" }),
            { type: "BindingIdentifier", name: "a" }
          )
        ])],
        null,
        emptyBody));

    testParse("function* a(){({[yield]:a}=0)}", function (p) {
        return p.body.statements[0].body.statements[0].expression;
      },
      new Shift.AssignmentExpression("=",
        new Shift.ObjectBinding([
          new Shift.BindingPropertyProperty(
            new Shift.ComputedPropertyName(new Shift.YieldExpression(null)),
            { type: "BindingIdentifier", name: "a" }
          )
        ]),
        new Shift.LiteralNumericExpression(0)));

    testParse("function *a(a=class extends yield{}){}", function (p) {
      return p.body.statements[0].parameters[0].init.super;
    }, { type: "IdentifierExpression", name: "yield" });
    testParse("function *a({[class extends yield{}]:a}){}", function (p) {
      return p.body.statements[0].parameters[0].properties[0].name.expression.super;
    }, { type: "IdentifierExpression", name: "yield" });


    testParse("function* a() {} function a() {}", id,
      new Shift.Script(new Shift.FunctionBody([], [
        new Shift.FunctionDeclaration(true, { type: "BindingIdentifier", name: "a" }, [], null, new Shift.FunctionBody([], [])),
        new Shift.FunctionDeclaration(false, { type: "BindingIdentifier", name: "a" }, [], null, new Shift.FunctionBody([], []))
      ]))
    );

    testParse("function a() { function* a() {} function a() {} }", stmt,
      new Shift.FunctionDeclaration(false, { type: "BindingIdentifier", name: "a" }, [], null, new Shift.FunctionBody([], [
        new Shift.FunctionDeclaration(true, { type: "BindingIdentifier", name: "a" }, [], null, new Shift.FunctionBody([], [])),
        new Shift.FunctionDeclaration(false, { type: "BindingIdentifier", name: "a" }, [], null, new Shift.FunctionBody([], []))
      ]))
    );

    testParseFailure("function* a(){function a(a=yield){}}", "Unexpected token yield");
    testParseFailure("function* a(){function* a(yield){}}", "Unexpected token yield");
    testParseFailure("function* a([yield]){}", "Unexpected token yield");
    testParseFailure("function* a({yield}){}", "Unexpected token yield");
    testParseFailure("function* a({yield=0}){}", "Unexpected token yield");
    testParseFailure("function* a({a:yield}){}", "Unexpected token yield");
    testParseFailure("function* a([yield,...a]){}", "Unexpected token yield");
    testParseFailure("function* a(){var yield}", "Unexpected token yield");
    testParseFailure("function yield(){\"use strict\";}", "Use of future reserved word in strict mode");
    testParseFailure("\"use strict\";function yield(){}", "Unexpected token yield");
    testParseFailure("({a(yield){}})", "Use of future reserved word in strict mode");
    testParseFailure("function *a(){function b(){yield}}", "Unexpected token yield");
  });
});
