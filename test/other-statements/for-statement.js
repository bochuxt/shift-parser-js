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

var assertEsprimaEquiv = require('../assertions').assertEsprimaEquiv;

describe("Parser", function () {
  describe("for statement", function () {
    assertEsprimaEquiv("for(;;);");
    assertEsprimaEquiv("for(;;){}");
    assertEsprimaEquiv("for(x = 0;;);");
    assertEsprimaEquiv("for(var x = 0;;);");
    assertEsprimaEquiv("for(let x = 0;;);");
    assertEsprimaEquiv("for(var x = 0, y = 1;;);");
    assertEsprimaEquiv("for(x = 0; x < 42;);");
    assertEsprimaEquiv("for(x = 0; x < 42; x++);");
    assertEsprimaEquiv("for(x = 0; x < 42; x++) process(x);");
    assertEsprimaEquiv("for(a;b;c);");
    assertEsprimaEquiv("for(var a;b;c);");
    assertEsprimaEquiv("for(var a = 0;b;c);");
    assertEsprimaEquiv("for(;b;c);");
  });
});
