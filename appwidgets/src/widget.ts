// Copyright (c) Max Simon
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers
} from '@jupyter-widgets/base';
import { executeJsString, utf8Tob64 } from './util';
declare var Jupyter: any;


import { MODULE_NAME, MODULE_VERSION } from './version';

export class ReactiveHtmlModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: ReactiveHtmlModel.model_name,
      _model_module: ReactiveHtmlModel.model_module,
      _model_module_version: ReactiveHtmlModel.model_module_version,
      _view_name: ReactiveHtmlModel.view_name,
      _view_module: ReactiveHtmlModel.view_module,
      _view_module_version: ReactiveHtmlModel.view_module_version,
      value: 'Hello World',
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name = 'ReactiveHtmlModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'ReactiveHtmlView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

// /**
// * Decode a base64 string
// * @function b64ToUtf8
// * @param  {String} str string to decode
// * @return {String} decoded string
// */
// function b64ToUtf8(str: string) {
//   return decodeURIComponent(escape(window.atob(str)));
// }

export class ReactiveHtmlView extends DOMWidgetView {

  customCss: HTMLStyleElement | null = null;

  render() {
    this.el.classList.add("mid-"+this.model.model_id);
    this.html_changed();
    this.css_changed();
    this.model.on({
      'change:_rendered': this.html_changed,
      'change:_css': this.css_changed
    }, this)

    // add event listener to set variables in model
    jQuery(this.el).on("click", "[data-rh-set]", ev => {
      const [varName, varValueRaw] = ev.target.dataset.rhSet.split("=");
      const varValue = JSON.parse(varValueRaw);
      this.model.set(varName, varValue);
      this.model.save_changes();
    })
    // add event listener to execute python code
    jQuery(this.el).on("click", "[data-rh-exec]", ev => {
      const pythonCode = ev.target.dataset.rhExec;
      console.log("Execute Python Code", pythonCode);
      this.execPython(pythonCode)
    })
    // add event listener to execute javascript code
    jQuery(this.el).on("click", "[data-rh-exec-js]", ev => {
      const jsCode = ev.target.dataset.rhExecJs;
      console.log("Execute JavaScript Code", jsCode);
      executeJsString(jsCode);
    })

//     // create a function in python to execute custom code
//     Jupyter.notebook.kernel.execute(`
// from base64 import b64decode
// def _exec_stdout(code_b64):
//     code = b64decode(code_b64).decode()
//     try:
//         res = None
//         try:
//             res = eval(code)
//         except Exception as e:
//             exec(code)
//         print("<--RETURN-->")
//         print(json.dumps({
//             "status": "success",
//             "result": res
//         }))
//     except Exception as e:
//         print("<--RETURN-->")
//         print(json.dumps({
//             "status": "error",
//             "errorType": type(e).__name__,
//             "errorMessage": str(e),
//             "code": code
//         }))
// `)
  }

  html_changed() {
    this.el.innerHTML = this.model.get('_rendered');
  }

  css_changed() {
    if(!this.customCss) {
      this.customCss = document.createElement("style");
      document.head.appendChild(this.customCss);
    }
    const encapsulatedCss = this.model.get('_css').replace(/<<VIEW_ID>>/g, "mid-"+this.model.model_id)
    this.customCss.innerHTML = encapsulatedCss;
  }

  execPython(pythonCode: string) {
    return new Promise((resolve, reject) => {
        try {
            // encode pythonCode to base64 string and pass it to JP._exec_to_stdout (see below)
            // stdout is the only way we can capture the response
            const cmd = "_exec_to_stdout('"+utf8Tob64(pythonCode)+"')";
            Jupyter.notebook.kernel.execute(
                cmd,
                {iopub: { output: (out: any) => {  // dont ask why, but this is the correct syntax
                    // out contains the whole stdout
                    // but we just want to parse the final result (which is everything after <--RETURN-->)
                    const rawResult = out.content.text;
                    const rawResultArr = rawResult.split("<--RETURN-->");
                    const result = JSON.parse(rawResultArr[rawResultArr.length - 1]);
                    // the result is always a dictionary with attributes status (--> success) and result (or errorType, errorMessage)
                    if(result.status == 'success') {
                        resolve(result.result);
                    } else {
                        reject(result.errorType+" :: "+result.errorMessage);
                    }
                }}}
            )
        }
        catch {
            reject("Unknown Error");
        }
    })
  }

}
