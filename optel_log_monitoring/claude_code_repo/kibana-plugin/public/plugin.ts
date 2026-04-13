import { CoreSetup, CoreStart, Plugin } from '@kbn/core/public';
import { DataPublicPluginStart } from '@kbn/data-plugin/public';
import { NavigationPublicPluginStart } from '@kbn/navigation-plugin/public';

export interface OtelLogMonitorStartDeps {
  data: DataPublicPluginStart;
  navigation: NavigationPublicPluginStart;
}

export class OtelLogMonitorPlugin
  implements Plugin<void, void, object, OtelLogMonitorStartDeps>
{
  public setup(core: CoreSetup<OtelLogMonitorStartDeps>): void {
    core.application.register({
      id: 'otelLogMonitor',
      title: 'OTel Log Monitor',
      async mount(params) {
        const [{ renderApp }, [coreStart, depsStart]] = await Promise.all([
          import('./application'),
          core.getStartServices(),
        ]);
        return renderApp(coreStart, depsStart as OtelLogMonitorStartDeps, params);
      },
    });
  }

  public start(core: CoreStart, deps: OtelLogMonitorStartDeps): void {
    // Register navigation entry
    deps.navigation.ui.TopNavMenu;
    core.chrome.navLinks.enableForcedAppSwitcherNavigation();
  }

  public stop(): void {}
}
