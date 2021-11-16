# appwidgets

This library implements custom Ipython Widgets to ease the development of web applications with Jupyter Notebooks.

## Installation

### Build Frontend

The models and views of the widgets are written in TypeScript and need to be compiled before using them in the browser. They are located in `src` folder.

First, install dependencies and `yarn`
```
npm install
npm install yarn
```

Afterwards, compile the TypeScript files
```
yarn build:prod
```
The webpacked JavaScript files are located in `appwidgets/nbextension/`.

### Install Python Package

Install the `appwidgets` package and enable the notebook extension
```
pip install ./appwidgets --user
jupyter nbextension install --sys-prefix --overwrite --py appwidgets
jupyter nbextension enable --sys-prefix --py appwidgets
```

## Usage

### SwitchBox

`SwitchBox` is similar to `Stacked` from Ipython widgets: you can specify a list of child views which are rendered upon a given condition.

Example:
```
switchbox = SwitchBox(
    children=(
        [view1, fn_cond_view1],
        [view2, fn_cond_view2]
    ),
    trait_names=['trait_name_1'],
    observe_children=False
)
```
In this example, the switchbox has to views. Each view is associated with a function which must return `True` if the view should be displayed and `False` if not. The function must accept two arguments: the SwitchBox object itself (here `switchbox`) and the corresponding view object (here `view1` or `view2`). 

In addition you can set a list of trait names which are created and observed. In this example, `switchbox` will have a trait `trait_name_1` which you can link to any other trait using the `link` function. The set of views will be updated whenever `trait_name_1` updates (or a linked trait). By this you can trigger updates in your views.

Finally you can observe all traits of the children to update the views whenever something changes in the child views.


### AppBox

AppBox is an extension of SwitchBox and is intended to be the root container of your application.

Example:
```
appbox = AppBox()
appbox.add_widget('start', view_start)
appbox.add_widget('contact', view_contact)
appbox.add_widget('items', view_items)
```
After creating an AppBox object you can register views together with a unique view key. Afterwards you can switch between your views using
```
appbox.view = 'contact'
```
This will display only the `view_contact` view. By this you can build up a navigation system in your application.

### JsPy

This widget allows you to execute Python code from JavaScript and JavaScript code from Python. It does not have a view.

Example:
```
jspy = JsPyWidget()
```
This will create a function in the global namespace `_exec_to_stdout` which can execute Python code and writes the result to stdout. This is necessary, because JavaScript can only read from stdout.

After creating a JsPyWidget, you can execute JavaScript code from Python using
```
jspy.execute_js('alert("Hallo Welt")', callback=fn_callback)
```
You can also execute Python code from JavaScript using
```
Jupyter.notebook.kernel.execute
```
see `src/widget.ts : execPython` for a reference implementation (or use from this widget directly).

### ReactiveHtmlWidget

This widget enhances the HTMLWidget from Ipython widgets. Instead of rendering static HTML, you can reference variables, do inline calculations and add on-click event handler via code.

Example:
```
rh = ReactiveHtmlWidget(
    """
    <p>The counter is currently ${counter}</p>
    """,
    data_model=data
)
```
The first argument is the HTML string. As you can see in the example, you can reference variables. For a complete set of features, see below. The second argument is optional and referes to a data_model from where the referenced variables are used. If the data model is not specified, all referenced variables are initialized as empty traits on the object.

#### Features

#### Load a CSS file from Notebook

You can add your own styles by loading a CSS file into the Jupyter notebook.
Example:
```
rh.load_css('/path/to/css', encapsulated=True)
```
This will load the content of the CSS file and apply it to the notebook. If `encapsulated=True` the styles are only applied to the current model, else it is applied globally.


##### Referencing variables

Every occurance of `${var}` will be replaced by the value of `var` (from traits or from `data_model`) before the HTML string is rendered. This means that you can use it everywhere, also in class lists or inline styles.

You can combine this with inline calculations like this: 
```
... style="width: {{ ${prob} * 100 }}%" ...
```
In this example, the variable `prob` is inserted and multiplied with 100 to transform it to percent. Inline calculations are marked by `{{ <expression> }}` and use Python syntax.

##### Conditional rendering

You can add `data-rh-if` attribute to any node in the HTML code. The corresponding node will only be rendered, if the condition evaluates to true.
Example:
```
    <div class="container">
        <p data-rh-if='${counter} < 100'>The counter is small</p>
        <p data-rh-if='${counter} >= 100'>The counter is above 100</p>
    </div>
```
In this example, only one p node will be shown, depending on the value of `counter`.

##### Click Event Handler

You can set `data-rh-set`, `data-rh-exec` and `data-rh-exec-js` to any element in the HTML Code.
Example:
```
    <button data-rh-set='view=contact'>Go to contact</button>
    <button data-rh-exec='python_fn("abc")'>Execute Python Code</button>
    <button data-rh-exec='alert("Button clicked")'>Execute JavaScript Code</button>
```
- `data-rh-set` is a shorthand for setting an attribute of the corresponding widget or data model. 
- `data-rh-exec` will trigger the execution of Python code (in the example it will execute the function `python_fn`). Make sure that everything can be executed from global context (where `_exec_to_stdout` from JsPy resides).
- `data-rh-exec-js` will trigger the execution of JavaScript code