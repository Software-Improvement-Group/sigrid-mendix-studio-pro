import { IComponent, getStudioProApi } from "@mendix/extensions-api";

// Gets an instance of the Studio Pro API by calling getStudioProApi and passing the componentContext
export const component: IComponent = {
    async loaded(componentContext) {
        const studioPro = getStudioProApi(componentContext);
        try {
            // Add a menu item to the Extensions menu
            await studioPro.ui.extensionsMenu.add({
                menuId: "qsmextension.MainMenu",
                caption: "QSM",
                subMenus: [
                    { menuId: "qsmextension.ShowTabMenuItem", caption: "QSM Settings" },
                    { menuId: "qsmextension.ShowDockMenuItem", caption: "Show QSM findings" },
                    { menuId: "qsmextension.HideDockMenuItem", caption: "Hide QSM findings" },
                ],
            });

            // Register the dockable pane for QSM findings
            const paneHandle = await studioPro.ui.panes.register(
                {
                    title: "QSM findings",
                    initialPosition: "bottom"
                },
                {
                    componentName: "extension/QSM",
                    uiEntrypoint: "dockablepane"
                }
            );

            // Open a tab or show/hide pane when menu items are clicked
            studioPro.ui.extensionsMenu.addEventListener(
                "menuItemActivated",
                (args) => {
                    if (args.menuId === "qsmextension.ShowTabMenuItem") {
                        studioPro.ui.tabs.open(
                            {
                                title: "QSM Configuration",
                            },
                            {
                                componentName: "extension/QSM",
                                uiEntrypoint: "tab",
                            }
                        );
                    }
                    else if (args.menuId === "qsmextension.ShowDockMenuItem") {
                        studioPro.ui.panes.open(paneHandle);
                    }
                    else if (args.menuId === "qsmextension.HideDockMenuItem") {
                        studioPro.ui.panes.close(paneHandle);
                    }
                }
            );

            // log successful initialization
            console.log("QSM extension loaded");
        } catch (err) {
            console.error("QSM initialization error:", err);
        }
    }
}

