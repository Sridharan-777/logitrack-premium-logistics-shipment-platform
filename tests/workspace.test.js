import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { INITIAL_SHIPMENTS } from '../src/data/mockData.js';

test('App supplies the repaired shipment, support and notification contracts', () => {
  const source = ts.createSourceFile('App.jsx', fs.readFileSync('src/App.jsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX);
  const expected = {
    ShipmentDetailsView: ['shipment', 'onBack', 'onTrack'],
    ShipmentsListView: ['shipments', 'user', 'onSelectShipment', 'onEditShipment', 'onQuickActionResolveHold'],
    SupportView: ['tickets', 'onSubmitTicket'],
    NotificationsView: ['notifications', 'onToggleRead', 'onMarkAllRead', 'onClearAll'],
  };
  const seen = new Set();
  function visit(node) {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const name = node.tagName.getText(source);
      if (expected[name]) {
        const props = node.attributes.properties.map(p => p.name?.getText(source));
        for (const prop of expected[name]) assert.ok(props.includes(prop), `${name} missing ${prop}`);
        seen.add(name);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source); assert.equal(seen.size, Object.keys(expected).length);
});

test('A valid shipment renders its waybill rather than the missing-record screen', async () => {
  const result = await build({ entryPoints: ['src/components/ShipmentDetailsView.jsx'], bundle: true, write: false, platform: 'node', format: 'cjs', external: ['react'], plugins: [{name:'omit-webgl',setup(b) { b.onResolve({filter:/ThreeDPackageViewer$/}, () => ({path:'preview',namespace:'stub'})); b.onLoad({filter:/.*/,namespace:'stub'}, () => ({contents:'export default function Preview(){ return null; }'})); }}] });
  const module = { exports: {} };
  new Function('module', 'exports', 'require', result.outputFiles[0].text)(module, module.exports, createRequire(import.meta.url));
  const html = renderToStaticMarkup(React.createElement(module.exports.default, {shipment: INITIAL_SHIPMENTS[0], onBack(){}, onTrack(){}}));
  assert.ok(html.includes(INITIAL_SHIPMENTS[0].id));
  assert.ok(!html.includes('Waybill Registry Not Found'));
});
