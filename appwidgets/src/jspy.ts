declare var Jupyter: any;

// Copyright (c) Max Simon
// Distributed under the terms of the Modified BSD License.

import {
    WidgetModel,
    ISerializers
  } from '@jupyter-widgets/base';
import { executeJsString } from './util';
  declare var Jupyter: any;
  
  
  import { MODULE_NAME, MODULE_VERSION } from './version';
  
  export class JsPyModel extends WidgetModel {
    defaults() {
      return {
        ...super.defaults(),
        _model_name: JsPyModel.model_name,
        _model_module: JsPyModel.model_module,
        _model_module_version: JsPyModel.model_module_version,
        value: 'Hello World',
      };
    }
  
    static serializers: ISerializers = {
      ...WidgetModel.serializers,
      // Add any extra serializers here
    };
  
    static model_name = 'JsPyModel';
    static model_module = MODULE_NAME;
    static model_module_version = MODULE_VERSION;

    initialize(attributes: any, options: {
        model_id: string;
        comm?: any;
        widget_manager: any;
    }): void {
      super.initialize(attributes, options);

      // set communication object in python
      Jupyter.notebook.kernel.execute(`
from base64 import b64decode
def _exec_to_stdout(code_b64):
    code = b64decode(code_b64).decode()
    try:
        res = None
        try:
            res = eval(code)
        except Exception as e:
            exec(code)
        print("<--RETURN-->")
        print(json.dumps({
            "status": "success",
            "result": res
        }))
    except Exception as e:
        print("<--RETURN-->")
        print(json.dumps({
            "status": "error",
            "errorType": type(e).__name__,
            "errorMessage": str(e),
            "code": code
        }))
      `)
      
      // add listener for custom messages
      this.comm?.on_msg(obj => {
        this.processMessage(obj);
      })

    }

    async processMessage(obj: any) {
      const message = obj.content.data;
      console.log("Got message", message);
      if(message.method == 'custom' && message.content.type == 'exec_js') {
        const execId = message.content.exec_id;
        const jsCode = message.content.code;

        try {
          const resRaw = executeJsString(jsCode);
          // handle promises
          let res = resRaw;
          if(typeof(resRaw) == 'object' && typeof(resRaw.then) == 'function') {
            res = await resRaw;
          }
          this.send({
            type: 'exec_js_result',
            code: jsCode,
            result: res,
            exec_id: execId
          }, {})
        }
        catch (e) {
          console.log(e);
          const errorName = (e && (<any>e).name) ? (<any>e).name : 'Unknown';
          this.send({
            type: 'exec_js_result',
            code: jsCode,
            error: errorName,
            exec_id: execId
          }, {})
        }

      }
    }

  }
  