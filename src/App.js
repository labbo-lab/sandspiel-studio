import React, { useRef, useState, useEffect } from "react";
import parserBabel from "prettier/parser-babel";
import { Xml } from "blockly/core";
import BlocklyJS from "blockly/javascript";
import starterXMLs from "./starterblocks.json";
import Sand from "./Sand.js";
import useStore, { globalState } from "./store";

import BlocklyComponent, { Block, Value, Field, Shadow } from "./Blockly";

import prettier from "prettier";

import "./blocks/customblocks";
import "./generator/generator";
import { loadPostFromServer } from "./loadPostFromServer";
import { pallette } from "./Render";

function generateCode(element, ws) {
  let baseBlock = undefined;
  for (let i = 0; i < ws.topBlocks_.length; i++) {
    const block = ws.topBlocks_[i];
    if (block.type == "sand_behavior_base") {
      baseBlock = block;
      break;
    }
  }
  try {
    let code = BlocklyJS.blockToCode(baseBlock);

    code = prettier.format(code, {
      parser: "babel",
      plugins: [parserBabel],
    });

    let xml = Xml.workspaceToDom(ws);
    let xmlText = Xml.domToPrettyText(xml);
    // eslint-disable-next-line no-new-func
    let fn = Function(code);
    useStore.getState().setXml(xmlText, element);
    globalState.updaters[element] = fn.bind(globalState);
  } catch (e) {
    console.error(e);
    return;
  }
}

const App = () => {
  let simpleWorkspace = useRef();
  const selectedElement = useStore((state) => state.selectedElement);
  const setSelected = useStore((state) => state.setSelected);
  const [loaded, setLoaded] = useState(false);
  const [fetchedData, setFetchedData] = useState(false);

  // generate all the code on start
  useEffect(async () => {
    await loadPostFromServer();
    setFetchedData(true);
  }, []);
  // generate all the code on start
  useEffect(async () => {
    if (!fetchedData || !simpleWorkspace.current) {
      return;
    }
    let ws = simpleWorkspace.current.primaryWorkspace;
    globalState.workspace = ws;
    BlocklyJS.init(ws);

    for (let i = useStore.getState().elements.length - 1; i >= 0; i--) {
      setSelected(i);

      ws.clear();

      await new Promise((resolve) => {
        let cb = () => {
          generateCode(i, ws);
          ws.removeChangeListener(cb);
          resolve();
        };
        ws.addChangeListener(cb);
        let xml = useStore.getState().xmls[i];
        let dom = Xml.textToDom(xml);
        try {
          Xml.domToWorkspace(dom, ws);
        } catch (e) {
          console.error(e);
        }
      });
    }
    setSelected(1);
    setLoaded(true);
    pallette();
  }, [simpleWorkspace, fetchedData]);

  useEffect(() => {
    if (simpleWorkspace.current && loaded) {
      let ws = simpleWorkspace.current.primaryWorkspace;
      globalState.workspace = ws;
      let cb = () => generateCode(selectedElement, ws);
      ws.addChangeListener(cb);
      return () => {
        ws.removeChangeListener(cb);
      };
    }
  }, [simpleWorkspace, selectedElement, loaded]);

  useEffect(() => {
    if (!simpleWorkspace.current || !loaded) return;
    simpleWorkspace.current.primaryWorkspace.clear();

    Xml.domToWorkspace(
      Xml.textToDom(useStore.getState().xmls[globalState.selectedElement]),
      simpleWorkspace.current.primaryWorkspace
    );
  }, [selectedElement, loaded]);

  let filter = ` brightness(1.0) contrast(0.1) saturate(0.1)`;
  if (loaded) {
    filter = "";
  }
  return (
    <div className="App">
      <BlocklyComponent
        style={{
          filter,
        }}
        ref={simpleWorkspace}
        collapse={false}
        comments={false}
        disable={false}
        maxBlocks={Infinity}
        readOnly={false}
        trashcan={false}
        media={"/media/"}
        renderer={"custom_renderer"}
        move={{
          scrollbars: true,
          drag: false,
          wheel: true,
        }}
        initialXml={starterXMLs[1]}
      >
        <Block type="group">
          <Value name="ITEM0">
            <Shadow type="element_literal">
              <Field name="VALUE">3</Field>
            </Shadow>
          </Value>
        </Block>
        <Block type="move">
          <Value name="DIRECTION">
            <Shadow type="vector_constant">
              <Field name="VALUE">DOWN</Field>
            </Shadow>
          </Value>
        </Block>
        <Block type="change_into">
          <Value name="CELL">
            <Shadow type="vector_constant">
              <Field name="VALUE">HERE</Field>
            </Shadow>
          </Value>
          <Value name="ELEMENT">
            <Shadow type="element_literal">
              <Field name="VALUE">3</Field>
            </Shadow>
          </Value>
        </Block>
        <Block type="is_block">
          <Value name="CELL">
            <Shadow type="vector_constant">
              <Field name="VALUE">DOWN</Field>
            </Shadow>
          </Value>
          <Value name="ELEMENT">
            <Shadow type="element_literal">
              <Field name="VALUE">0</Field>
            </Shadow>
          </Value>
        </Block>
        <Block type="is_touching">
          <Value name="ELEMENT">
            <Shadow type="element_literal">
              <Field name="VALUE">2</Field>
            </Shadow>
          </Value>
        </Block>
        <Block type="element_cell">
          <Value name="CELL">
            <Shadow type="vector_constant">
              <Field name="VALUE">DOWN</Field>
            </Shadow>
          </Value>
        </Block>
        <Block type="vector_constant">
          <Field name="VALUE">HERE</Field>
        </Block>
        <Block type="vector_literal">
          <Value name="X">
            <Shadow type="number_literal">
              <Field name="VALUE">0</Field>
            </Shadow>
          </Value>
          <Value name="Y">
            <Shadow type="number_literal">
              <Field name="VALUE">0</Field>
            </Shadow>
          </Value>
        </Block>

        <Block type="in_a_random">
          <Field name="NAME">ROTATION</Field>
        </Block>
        <Block type="rotated_by">
          <Value name="NUMBER">
            <Shadow type="number_literal">
              <Field name="VALUE">0</Field>
            </Shadow>
          </Value>
        </Block>
        {/* <Block type="for_all">
          <Field name="NAME">ROTATION</Field>
        </Block> */}
        <Block type="number_literal">
          <Field name="VALUE">0</Field>
        </Block>
        <Block type="operation">
          <Field name="OPERATION">ADD</Field>
          <Value name="A">
            <Shadow type="number_literal">
              <Field name="VALUE">0</Field>
            </Shadow>
          </Value>
          <Value name="B">
            <Shadow type="number_literal">
              <Field name="VALUE">0</Field>
            </Shadow>
          </Value>
        </Block>
        <Block type="random_number">
          <Value name="MIN">
            <Shadow type="number_literal">
              <Field name="VALUE">-1</Field>
            </Shadow>
          </Value>
          <Value name="MAX">
            <Shadow type="number_literal">
              <Field name="VALUE">1</Field>
            </Shadow>
          </Value>
        </Block>
        <Block type="one_in">
          <Value name="NUMBER">
            <Shadow type="number_literal">
              <Field name="VALUE">2</Field>
            </Shadow>
          </Value>
        </Block>
        {/* <Block type="repeat">
          <Value name="NUMBER">
            <Shadow type="number_literal">
              <Field name="VALUE">2</Field>
            </Shadow>
          </Value>
        </Block> */}
        <Block type="controls_if"></Block>
        {/* <Block type="if"></Block> */}
        <Block type="key_pressed"></Block>
        <Block type="comparison">
          <Field name="COMPARISON">IS</Field>
        </Block>
        <Block type="boolean_operation">
          <Field name="OPERATION">AND</Field>
        </Block>
        <Block type="bool_literal">
          <Field name="VALUE">TRUE</Field>
        </Block>
        <Block type="not"></Block>
        <Block type="get_r_cell_flexible">
          <Field name="DATA">RA</Field>
        </Block>
        <Block type="modify_r_cell_flexible">
          <Field name="DATA">RA</Field>
          <Value name="VALUE">
            <Shadow type="number_literal">
              <Field name="VALUE">0</Field>
            </Shadow>
          </Value>
        </Block>
        <Block type="set_r_cell_flexible">
          <Field name="DATA">RA</Field>
          <Value name="VALUE">
            <Shadow type="number_literal">
              <Field name="VALUE">0</Field>
            </Shadow>
          </Value>
        </Block>
      </BlocklyComponent>
      <Sand />
    </div>
  );
};

export default App;
