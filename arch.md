# Architecture

The extension is divided into 3 main components:

 - Extension Process
 - Python Server
 - Webview

![arch-overview.png](Architecture overview)

## Python Server

Responsible for translating between the graph (JSON format) and DFF python code. To speed up the conversion, the python process will keep running in the background. It will receieve commands and respond via pipe, in JSON format.

**What is done**

 - Most of the main functionality is working
	- Translating python to graph
	- Partial updates on python code based on the new graph
 - The converting scripts are just one-off processes, they shut down after one translation

**What needs to be done**

 - Restructure the indiviudla scripts into one server
 - Make the partial code updates more robust, add unit tests
 - Scan with regex for the DSL instead of parsing the whole file
 - Add caching to python parsing 

## Extension Process

Message broker. Routes messages between the other components. If multiple editors are open, each has an instance of the broker, to avoid conflicts.

Universal message format (JSON):

 - `"target"`: enum
	- `"vsc"` - api calls to vscode (update python file for eg.)
	- `"py"` -  new graph/code to the python server
	- `"view"` - new graph to renderer
	- `"api"` - api call to external services (annotators, etc.)
 - `"action"`: string - name of the action to be performed, depends on the target
 - `"payload"`: optional object - parameters to the action

**What needs to be done**

 - Unit tests for the router
 - Message router
 - Message handlers for each target

## Webview

A React application, responsible for rendering the graph and allowing the user to edit it.

Frontend stack:

 - Typescript (+ esbuild for transpilation)
 - React
 - Goober *(CSS-in-JS)*
 - React-flow *(graph rendering)*
 - Storybook *(isolated component development, BDD and snapshot testing)*
 - Cypress *(integration testing outside VSCode, in a mocked environment)*

**What needs is done**

 - Graph rendering
 - Graph layout

**What needs to be done**

 - State management - central store that keeps the current graph
 - Node and transition components
 - Sidebar
	- Seperate editors for each context (conditions, response)
 - Adding transitions
	- Integrate recommendation system
	- Allow connecting to existing nodes
 - Renaming, deleting nodes

# Plan 1 - Assuming no tight deadline (aka. doing things properly)

## Phase I (2 weeks)

Finishing the python server. This gets priority, because any improvements/fixes made here can be released with the drawio-based version as well.

## Phase II (~4 weeks)

Extension process and the webview. By the end of this phase, the extension should be usable.

 1. Message broker and unit tests for it - *1 week*
 2. Visual components and tests - *2 weeks*
	- Node, transition
	- Sidebar
	- Condition editor
	- Response editor
 3. Integrating with recommendations - *3-4 days*
 4. Node renaming and deleting - *2-3 days*

## Phase III (indefinite)

Integration of statistics, new annotators, auto response generators and any other new features.

Adding cypress integration testing.

# Plan 2 - Assuming deadline at the end of Feb. (aka. doing things as usual)

Changes to the python part, tests and storybook are deferred until after the deadline.

 1. Barebones message broker - *2-3 days*
 2. Integrating with recommendations - *3-4 days*
 3. Visual components - *<2 weeks*
	- Node, transition
	- Sidebar
	- Condition editor
	- Response editor 


