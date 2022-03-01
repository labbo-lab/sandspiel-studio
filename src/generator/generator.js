/**
 * @license
 *
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Define generation methods for custom blocks.
 * @author samelh@google.com (Sam El-Husseini)
 */

// More on generating code:
// https://developers.google.com/blockly/guides/create-custom-blocks/generating-code

import * as Blockly from "blockly/core";
import elements from "../Sand";
import "blockly/javascript";

Blockly.JavaScript["sand_behavior_base"] = function (block) {
  const body = Blockly.JavaScript.statementToCode(block, "body");
  return body;
};

Blockly.JavaScript["number_literal"] = function (block) {
  const number = block.getFieldValue("VALUE");
  return [number, Blockly.JavaScript.ORDER_ATOMIC];
};

const ELEMENT_IDS = {}
for (let i = 0; i < elements.length; i++) {
  const elementName = elements[i];
  ELEMENT_IDS[elementName.toUpperCase()] = i;
}

Blockly.JavaScript["element_literal"] = function (block) {
  const elementName = block.getFieldValue("VALUE");
  const elementId = ELEMENT_IDS[elementName];
  return [elementId, Blockly.JavaScript.ORDER_ATOMIC];
}