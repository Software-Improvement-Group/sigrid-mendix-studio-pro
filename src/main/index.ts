import { IComponent, getStudioProApi, type DockablePaneHandle } from "@mendix/extensions-api";

// Gets an instance of the Studio Pro API by calling getStudioProApi and passing the componentContext
export const component: IComponent = {
    async loaded(componentContext) {
        const studioPro = getStudioProApi(componentContext);
        try {
            let paneHandle: DockablePaneHandle | null = null;

            const ensurePaneRegistered = async (): Promise<DockablePaneHandle> => {
                if (!paneHandle) {
                    paneHandle = await studioPro.ui.panes.register(
                        {
                            title: "QSM findings",
                            initialPosition: "bottom"
                        },
                        {
                            componentName: "extension/QSM",
                            uiEntrypoint: "dockablepane"
                        }
                    );
                }
                return paneHandle;
            };

            // Add menu items with action callbacks
            await studioPro.ui.extensionsMenu.add({
                menuId: "qsmextension.MainMenu",
                caption: "QSM",
                subMenus: [
                    {
                        menuId: "qsmextension.ShowTabMenuItem",
                        caption: "QSM Settings",
                        action: async () => {
                            await studioPro.ui.tabs.open(
                                {
                                    title: "QSM Configuration",
                                },
                                {
                                    componentName: "extension/QSM",
                                    uiEntrypoint: "tab",
                                }
                            );
                        },
                    },
                    {
                        menuId: "qsmextension.ShowDockMenuItem",
                        caption: "Show QSM findings",
                        action: async () => {
                            const handle = await ensurePaneRegistered();
                            await studioPro.ui.panes.open(handle);
                        },
                    },
                    {
                        menuId: "qsmextension.HideDockMenuItem",
                        caption: "Hide QSM findings",
                        action: async () => {
                            const handle = await ensurePaneRegistered();
                            await studioPro.ui.panes.close(handle);
                        },
                    },
                ],
            });

            // log successful initialization
            console.log("QSM extension loaded");
        } catch (err) {
            console.error("QSM initialization error:", err);
        }
    }
}

