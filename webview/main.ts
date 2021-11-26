import React from 'react'
import { render } from 'react-dom'
import GraphEditor from './GraphEditor'

// const vscode = acquireVsCodeApi();

const root = document.getElementById('root') as HTMLDivElement;
render(React.createElement(GraphEditor), root)
