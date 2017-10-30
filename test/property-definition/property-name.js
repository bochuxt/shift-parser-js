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

let expr = require('../helpers').expr;
let testParse = require('../assertions').testParse;
let testParseFailure = require('../assertions').testParseFailure;

suite('Parser', () => {
  suite('property name', () => {


    testParse('({get b() {}})', expr,
      {
        type: 'ObjectExpression',
        properties: [{
          type: 'Getter',
          name: { type: 'StaticPropertyName', value: 'b' },
          body: { type: 'FunctionBody', directives: [], statements: [] },
        }],
      }
    );


    testParseFailure('({[1,2]:3})', 'Unexpected token ","');
    testParseFailure('({ *a })', 'Unexpected token "}"');
    testParseFailure('({ *a: 0 })', 'Unexpected token ":"');
    testParseFailure('({ *[0]: 0 })', 'Unexpected token ":"');
  });
});
