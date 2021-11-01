describe("close() Should", () => {

    const baseRowConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };

    const baseColumnConfig = {
        children: [
            {
                type: "column",
                children: [
                    {
                        type: "row",
                        children: [
                            {
                                type: "group",
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: "row",
                        children: [
                            {
                                type: "group",
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };

    const baseGroupConfig = {
        children: [
            {
                type: "group",
                children: [
                    {
                        type: "window",
                        appName: "noGlueApp"
                    }
                ]
            }
        ]
    };

    afterEach(async () => {
        const wsps = await glue.workspaces.getAllWorkspaces();
        await Promise.all(wsps.map((wsp) => wsp.close()));
    });

    it("remove all elements from the workspace when the base element has been closed and it is a row", async () => {
        const workspace = await glue.workspaces.createWorkspace(baseRowConfig);

        await workspace.children[0].close();
        await workspace.refreshReference();

        expect(workspace.children.length).to.eql(0);
    });

    it("remove all elements from the workspace when the base element has been closed and it is a column", async () => {
        const workspace = await glue.workspaces.createWorkspace(baseColumnConfig);

        await workspace.children[0].close();
        await workspace.refreshReference();

        expect(workspace.children.length).to.eql(0);
    });

    it("remove all elements from the workspace when the base element has been closed and it is a group", async () => {
        const workspace = await glue.workspaces.createWorkspace(baseGroupConfig);

        await workspace.children[0].close();
        await workspace.refreshReference();

        expect(workspace.children.length).to.eql(0);
    });

});
