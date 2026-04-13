import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from '@kbn/core/public';
import { Dashboard } from './components/Dashboard';
import { OtelLogMonitorStartDeps } from './plugin';

export function renderApp(
  core: CoreStart,
  deps: OtelLogMonitorStartDeps,
  { element }: AppMountParameters
): () => void {
  ReactDOM.render(<Dashboard core={core} deps={deps} />, element);
  return () => ReactDOM.unmountComponentAtNode(element);
}
