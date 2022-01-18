import React from 'react'
import { render } from 'react-dom'
import { setup } from 'goober'

import GraphEditor from './GraphEditor'

// const vscode = acquireVsCodeApi();

setup(React.createElement)

const root = document.getElementById('root') as HTMLDivElement;
render(React.createElement(GraphEditor), root)
