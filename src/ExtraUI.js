import React, { useState } from "react";
import { encode } from "fast-png";

import { seed, width, height, sands } from "./SandApi";
import { snapshot } from "./Render";
import { useStore } from "./store";
// import { UPDATE_SCHEMES } from "./updateSchemes";
import * as vkbeautify from "vkbeautify";
import { base64ArrayBuffer } from "./base64ArrayBuffer";
import PlayPause from "./PlayPauseButton";
const imageURLBase =
  "https://storage.googleapis.com/sandspiel-studio/creations/";

function prepareExport() {
  let regex = /id="([^\\]*?)"/g;
  let minifiedXmls = useStore
    .getState()
    .xmls.map((x) => vkbeautify.xmlmin(x).replaceAll(regex, ""));
  let json = JSON.stringify(minifiedXmls, null, " ");
  return json;
}
const ExtraUI = ({}) => {
  let [id, setId] = useState(null);
  let [copiedState, setCopiedState] = useState(null);
  let [sharedState, setSharedState] = useState(null);

  return (
    <div className="extras-tray">
      <PlayPause />
      <button
        className="simulation-button"
        onClick={() => {
          seed();
        }}
      >
        Reset
      </button>

      <div>
        <button
          className="simulation-button"
          onClick={() => {
            let json = prepareExport();
            let thumbnail = snapshot();

            let buffer = encode({
              width,
              height,
              data: sands,
            });
            let data = "data:image/png;base64," + base64ArrayBuffer(buffer);

            setSharedState(" ...");

            fetch("/api/upload", {
              method: "post",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                code: json,
                thumbnail,
                data,
              }),
            })
              .then(function (response) {
                return response.json();
              })
              .then(function ({ id }) {
                window.history.pushState({}, "sand blocks", "/post/" + id);
                setId(id);

                var data = [
                  // eslint-disable-next-line no-undef
                  new ClipboardItem({
                    "text/plain": new Blob([window.location.href], {
                      type: "text/plain",
                    }),
                  }),
                ];
                navigator.clipboard.write(data).then(
                  function () {
                    setSharedState(" ✓ Copied");
                  },
                  function () {
                    setSharedState("...Error");
                  }
                );
              });
          }}
        >
          Get Share Link {sharedState}
        </button>
        {sharedState === " ✓ Copied" && (
          <>
            <pre style={{ fontSize: "1rem", color: "blue" }}>
              {window.location.href}
            </pre>
            <img src={`${imageURLBase}${id}.png`}></img>
          </>
        )}
        <br />
        <br />
        <br />
        <br />
        {window.location.host.includes("localhost") && (
          <button
            className="simulation-button"
            onClick={() => {
              let json = prepareExport();

              var data = [
                // eslint-disable-next-line no-undef
                new ClipboardItem({
                  "text/plain": new Blob([json], { type: "text/plain" }),
                }),
              ];
              navigator.clipboard
                .write(data)
                .then(
                  function () {
                    setCopiedState(" ✓");
                  },
                  function () {
                    setCopiedState("...Error");
                  }
                )
                .finally(() => {
                  window.setTimeout(() => {
                    setCopiedState(null);
                  }, 3000);
                });
            }}
          >
            Export to Clipboard {copiedState}
          </button>
        )}

        <img className="wordmark" src="/sandspiel.png"></img>
      </div>
    </div>
  );
};
export default ExtraUI;
