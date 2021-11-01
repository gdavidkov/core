describe("addRow() Should", () => {
    const decorationsHeight = 30;
    const config = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "row",
                                children: []
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
                                        appName: "dummyApp"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: []
                    }
                ]
            }
        ]
    };

    let workspace = undefined;
    before(() => coreReady);

    beforeEach(async () => {
        await glue.workspaces.createWorkspace(config);
        workspace = await glue.workspaces.createWorkspace(config);
        await glue.workspaces.createWorkspace(config);
    });

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return the row when the parent is a column and is passed a row definition", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        const row = await column.addRow({ type: "row", children: [] });

        expect(row).to.not.be.undefined;
        expect(row.constructor.name).to.eql("Row");
    });

    it("add the row when the parent is a colum and is passed a row definition", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        await column.addRow({ type: "row", children: [] });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("return the row when the parent is a column and is passed row as a type", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        const row = await column.addRow({ type: "row" });

        expect(row).to.not.be.undefined;
        expect(row.constructor.name).to.eql("Row");
    });

    it("add the row when the parent is a column and is passed row as a type", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        await column.addRow({ type: "row" });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("return the row when the parent is a column and a children array is passed", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        const row = await column.addRow({ children: [] });

        expect(row).to.not.be.undefined;
        expect(row.constructor.name).to.eql("Row");
    });

    it("add the row when the parent is a column and a children array is passed", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        await column.addRow({ children: [] });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("add a single row when the workspace's root element has been closed", async () => {
        const emptyWorkspace = await glue.workspaces.createWorkspace({ children: [] });
        const row = await emptyWorkspace.addRow();

        await row.addColumn();
        await row.addColumn();
        await row.close();
        await emptyWorkspace.addRow();
        await emptyWorkspace.refreshReference();

        const boxesInWorkspace = emptyWorkspace.getAllBoxes();

        expect(boxesInWorkspace.length).to.eql(1);
    });

    it("add multiple empty rows to an empty column when the workspace is empty", async ()=>{
        const emptyWorkspace = await glue.workspaces.createWorkspace({ children: [] });
        const column = await emptyWorkspace.addColumn();

        await column.addRow();
        await column.addRow();
        await column.addRow();

        const rowsInWorkspace = emptyWorkspace.getAllRows();

        expect(rowsInWorkspace.length).to.eql(3);
    });


    it("add the row and update the context of the windows in it when a window definition array is passed with contexts", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        const firstContext = {
            first: true
        };

        const secondContext = {
            second: true
        };

        const row = await column.addRow({
            children: [
                {
                    type: "window",
                    context: firstContext,
                    appName: "dummyApp"
                },
                {
                    type: "window",
                    context: secondContext,
                    appName: "dummyApp"
                }
            ]
        });

        await Promise.all(row.children.map((w) => w.forceLoad()));
        await workspace.refreshReference();

        const wait = new Promise((r) => setTimeout(r, 3000));
        await wait;

        await Promise.all(row.children.map(async (w, i) => {
            const glueWin = w.getGdWindow();
            const winContext = await glueWin.getContext();

            if (winContext.first) {
                expect(winContext).to.eql(firstContext);
            } else if (winContext.second) {
                expect(winContext).to.eql(secondContext);
            } else {
                throw new Error(`The window context was not set successfuly ${JSON.stringify(winContext)}`);
            }
        }));
    });

    it("return the row when the parent is a column and is without arguments", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        const row = await column.addRow();

        expect(row).to.not.be.undefined;
        expect(row.constructor.name).to.eql("Row");
    });

    it("add the row when the parent is a column and is without arguments", async () => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        await column.addRow();
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("add the row with allow drop false when its parent has been locked", async () => {
        const column = workspace.getAllColumns().find(c => c.children.length === 0);

        await column.lock();

        const row = await column.addRow({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp"
                }
            ]
        });

        await workspace.refreshReference();

        expect(row.allowDrop).to.be.false;
    });

    it("update the constraints when the row has constraints passed", async () => {
        const column = workspace.getAllColumns().find(c => c.children.length === 0);

        const row = await column.addRow({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp"
                },
            ],
            config: {
                minHeight: 500,
                maxHeight: 600
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(80);
        expect(workspace.minHeight).to.eql(500);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.maxHeight).to.eql(600);
    });

    it("not update the constraints when the row has invalid constraints", async () => {
        const column = workspace.getAllColumns().find(c => c.children.length === 0);

        const row = await column.addRow({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp"
                },
            ],
            config: {
                minHeight: 600,
                maxHeight: 500
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(80);
        expect(workspace.minHeight).to.eql(20 + decorationsHeight);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.maxHeight).to.eql(32767);
    });

    it("not update the constraints when the row has invalid constraints inside", async () => {
        const column = workspace.getAllColumns().find(c => c.children.length === 0);

        const row = await column.addRow({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp",
                    config: {
                        minHeight: 600,
                        maxHeight: 500
                    }
                },
            ]
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(80);
        expect(workspace.minHeight).to.eql(20 + decorationsHeight);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.maxHeight).to.eql(32767);
    });

    it("not update the constraints when the row has incompatible constraints inside", async () => {
        const column = workspace.getAllColumns().find(c => c.children.length === 0);

        const row = await column.addRow({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp",
                    config: {
                        minHeight: 500,
                        maxHeight: 600
                    }
                },
            ],
            config: {
                minHeight: 700,
                maxHeight: 900
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(80);
        expect(workspace.minHeight).to.eql(20 + decorationsHeight);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.maxHeight).to.eql(32767);
    });

    it("add a locked row when a config with allowDrop:false is passed", async () => {
        const column = workspace.getAllColumns()[0];

        const row = await column.addRow({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp",
                }
            ],
            config: {
                allowDrop: false
            }
        });

        await workspace.refreshReference();

        expect(row.allowDrop).to.be.false;
    });

    it("add a row with locked contents when a config with allowDrop:false is passed", async () => {
        const column = workspace.getAllColumns()[0];

        const row = await column.addRow({
            children: [
                {
                    type: "group",
                    children: [
                        {
                            type: "window",
                            appName: "noGlueApp"
                        },
                    ]
                }
            ],
            config: {
                allowDrop: false
            }
        });

        await workspace.refreshReference();

        expect(row.children[0].allowDrop).to.be.false;
    });

    it("add a locked row with unlocked contents when the children override the allowDrop constraint", async () => {
        const column = workspace.getAllColumns()[0];

        const row = await column.addRow({
            children: [
                {
                    type: "group",
                    children: [
                        {
                            type: "window",
                            appName: "noGlueApp"
                        },
                    ],
                    config: {
                        allowDrop: true
                    }
                }
            ],
            config: {
                allowDrop: false
            }
        });

        await workspace.refreshReference();

        expect(row.allowDrop).to.be.false;
        expect(row.children[0].allowDrop).to.be.true;
    });

    // allowSplitters
    it("add a locked row when a config with allowSplitters:false is passed", async () => {
        const column = workspace.getAllColumns()[0];

        const row = await column.addRow({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp",
                }
            ],
            config: {
                allowSplitters: false
            }
        });

        await workspace.refreshReference();

        expect(row.allowSplitters).to.be.false;
    });

    it("add a row with locked contents when a config with allowSplitters:false is passed", async () => {
        const column = workspace.getAllColumns()[0];

        const row = await column.addRow({
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
                                },
                            ]
                        }
                    ]
                }
            ],
            config: {
                allowSplitters: false
            }
        });

        await workspace.refreshReference();

        expect(row.children[0].allowSplitters).to.be.false;
    });

    it("add a locked row with unlocked contents when the children override the allowSplitters constraint", async () => {
        const column = workspace.getAllColumns()[0];

        const row = await column.addRow({
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
                                },
                            ]
                        }
                    ],
                    config: {
                        allowSplitters: true
                    }
                }
            ],
            config: {
                allowSplitters: false
            }
        });

        await workspace.refreshReference();

        expect(row.allowSplitters).to.be.false;
        expect(row.children[0].allowSplitters).to.be.true;
    });

    it("preserve the placeholder element when the row with a window is added to a parent element of the placeholder and the parent is a column", async () => {
        const workspace = await glue.workspaces.createWorkspace({ children: [] })
        const column = await workspace.addColumn();
        await column.addRow();
        await column.addRow({ children: [{ appName: "noGlueApp", type: "window" }] });
        await workspace.refreshReference();

        expect(workspace.getAllRows().length).to.eql(2);
    });

    it("preserve the placeholder element when the row with a window is added to a parent element of the placeholder and the parent is a column and the placeholder is in a group", async () => {
        const workspace = await glue.workspaces.createWorkspace({ children: [] })
        const column = await workspace.addColumn();
        await column.addGroup();
        await column.addRow({ children: [{ appName: "noGlueApp", type: "window" }] });
        await workspace.refreshReference();

        expect(workspace.getAllGroups().length).to.eql(1);
    });

    it("reject when the parent is a row and is passed a row definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        row.addRow({ type: "row", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());

    });

    it("reject when the parent is a group and is passed a row definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const group = allBoxes.find(p => p.type === "group");
        group.addRow({ type: "row", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    it("reject when the parent is a column and the arguments is a column definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        column.addRow({ type: "column", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    it("reject when the parent is a column and the arguments is a group definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        column.addRow({ type: "group", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    it("reject when the parent is a row and the arguments is a window definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const column = allBoxes.find(p => p.type === "column");
        column.addRow({ type: "window" }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    it("reject when there is a maximized window in the workspace", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const window = workspace.getAllWindows()[0];
        const column = allBoxes.find(p => p.type === "column");
        window.maximize().then(() => {
            return column.addRow({ type: "row", children: [] });
        }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    Array.from(["row", "column", "group"]).forEach((maximizedParentType) => {
        it(`reject when there is a maximized ${maximizedParentType} in the workspace`, (done) => {
            const allBoxes = workspace.getAllBoxes();
            const parent = allBoxes.find(b => b.type === maximizedParentType);
            const column = allBoxes.find(p => p.type === "column");
            parent.maximize().then(() => {
                return column.addRow({ type: "row", children: [] });
            }).then(() => {
                done("Should not resolve");
            }).catch(() => done());
        });
    });
});
