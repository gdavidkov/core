describe("addColumn() Should", () => {
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

    const verticalDecorations = 30;
    let workspace = undefined;
    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(config);
    });

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return the column when the box parent is a row and is passed a column definition", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        const column = await row.addColumn({ type: "column", children: [] });

        expect(column).to.not.be.undefined;
        expect(column.constructor.name).to.eql("Column");
    });

    it("add the column when the box parent is a row and is passed a column definition", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        await row.addColumn({ type: "column", children: [] });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("return the column when the box parent is a row and is passed column as a type", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        const column = await row.addColumn({ type: "column" });

        expect(column).to.not.be.undefined;
        expect(column.constructor.name).to.eql("Column");
    });

    it("add the column when the box parent is a row and is passed column as a type", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        await row.addColumn({ type: "column" });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("return the column when the box parent is a row and a children array is passed", async () => {
        const allBox = workspace.getAllBoxes();
        const row = allBox.find(p => p.type === "row");
        const column = await row.addColumn({ children: [] });

        expect(column).to.not.be.undefined;
        expect(column.constructor.name).to.eql("Column");
    });

    it("add the column when the box parent is a row and a children array is passed", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        await row.addColumn({ children: [] });
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("add the column and update the context of the windows in it when a window definition array is passed with contexts", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        const firstContext = {
            first: true
        };

        const secondContext = {
            second: true
        };

        const column = await row.addColumn({
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

        await Promise.all(column.children.map((w) => w.forceLoad()));
        await workspace.refreshReference();

        const wait = new Promise((r) => setTimeout(r, 3000));
        await wait;

        await Promise.all(column.children.map(async (w, i) => {
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

    it("return the column when the box parent is a row and is without arguments", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        const column = await row.addColumn();

        expect(column).to.not.be.undefined;
        expect(column.constructor.name).to.eql("Column");
    });

    it("add a single column when the workspace's root element has been closed", async () => {
        const emptyWorkspace = await glue.workspaces.createWorkspace({ children: [] });
        const column = await emptyWorkspace.addColumn();

        await column.addRow();
        await column.addRow();
        await column.close();
        await emptyWorkspace.addColumn();
        await emptyWorkspace.refreshReference();

        const boxesInWorkspace = emptyWorkspace.getAllBoxes();

        expect(boxesInWorkspace.length).to.eql(1);
    });

    it("add multiple empty columns to an empty row when the workspace is empty", async ()=>{
        const emptyWorkspace = await glue.workspaces.createWorkspace({ children: [] });
        const row = await emptyWorkspace.addRow();

        await row.addColumn();
        await row.addColumn();
        await row.addColumn();

        const columnsInWorkspace = emptyWorkspace.getAllColumns();

        expect(columnsInWorkspace.length).to.eql(3);
    });

    it("add the column when the box parent is a row and is without arguments", async () => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        await row.addColumn();
        await workspace.refreshReference();

        const allBoxesAfterAdd = workspace.getAllBoxes();
        expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
    });

    it("update the constraints when a column with constraints is added", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp"
                }
            ],
            config: {
                minWidth: 500,
                maxWidth: 1000
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(560);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.minHeight).to.eql(20 + verticalDecorations);
        expect(workspace.maxWidth).to.eql(32767);
    });

    it("not update the constraints when a column with invalid constraints is added", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp"
                }
            ],
            config: {
                minWidth: 1000,
                maxWidth: 900
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(80);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.minHeight).to.eql(20 + verticalDecorations);
        expect(workspace.maxWidth).to.eql(32767);
    });

    it("not update the constraints when a column with incompatible inner constraints is added", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
            children: [
                {
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp",
                    config: {
                        minWidth: 1200,
                        maxWidth: 1900
                    }
                }
            ],
            config: {
                minWidth: 900,
                maxWidth: 1000
            }
        });

        await workspace.refreshReference();

        expect(workspace.minWidth).to.eql(80);
        expect(workspace.maxWidth).to.eql(32767);
        expect(workspace.minHeight).to.eql(20 + verticalDecorations);
        expect(workspace.maxWidth).to.eql(32767);
    });

    it("add a locked column when a config with allowDrop:false is passed", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
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

        expect(column.allowDrop).to.be.false;
    });

    it("add a column with locked contents when a config with allowDrop:false is passed", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
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

        expect(column.children[0].allowDrop).to.be.false;
    });

    it("add a locked column with unlocked contents when the children override the allowDrop constraint", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
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

        expect(column.allowDrop).to.be.false;
        expect(column.children[0].allowDrop).to.be.true;
    });
    // allowSplitters
    it("add a locked column when a config with allowSplitters:false is passed", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
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

        expect(column.allowSplitters).to.be.false;
    });

    it("add a column with locked contents when a config with allowSplitters:false is passed", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
            children: [
                {
                    type:"row",
                    children:[
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

        expect(column.children[0].allowSplitters).to.be.false;
    });

    it("add a locked column with unlocked contents when the children override the allowDrop constraint", async () => {
        const row = workspace.getAllRows()[0];

        const column = await row.addColumn({
            children: [
                {
                    type:"row",
                    children:[
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

        expect(column.allowSplitters).to.be.false;
        expect(column.children[0].allowSplitters).to.be.true;
    });

    it("add a column with valid width when the column is pinned", async () => {
        const row = workspace.getAllRows().find(r => r.children.length);

        const column = await row.addColumn({
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
                isPinned: true
            }
        });

        await workspace.refreshReference();

        expect(column.width > column.minWidth).to.be.true;
    });

    it("preserve the placeholder element when the column with a window is added to a parent element of the placeholder and the parent is a row", async () => {
        const workspace = await glue.workspaces.createWorkspace({ children: [] })
        const row = await workspace.addRow();
        await row.addColumn();
        await row.addColumn({ children: [{ appName: "noGlueApp", type: "window" }] });
        await workspace.refreshReference();

        expect(workspace.getAllColumns().length).to.eql(2);
    });

    it("preserve the placeholder element when the column with a window is added to a parent element of the placeholder and the parent is a row and the placeholder is in a group", async () => {
        const workspace = await glue.workspaces.createWorkspace({ children: [] })
        const row = await workspace.addRow();
        await row.addGroup();
        await row.addColumn({ children: [{ appName: "noGlueApp", type: "window" }] });
        await workspace.refreshReference();

        expect(workspace.getAllGroups().length).to.eql(1);
    });

    describe("", () => {
        beforeEach(async () => {
            await glue.workspaces.createWorkspace(config);
        });

        it("return the column when the box parent is a row and is passed a column definition when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            const column = await row.addColumn({ type: "column", children: [] });

            expect(column).to.not.be.undefined;
            expect(column.constructor.name).to.eql("Column");
        });

        it("add the column when the box parent is a row and is passed a column definition when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            await row.addColumn({ type: "column", children: [] });
            await workspace.refreshReference();

            const allBoxesAfterAdd = workspace.getAllBoxes();
            expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
        });

        it("return the column when the box parent is a row and is passed column as a type when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            const column = await row.addColumn({ type: "column" });

            expect(column).to.not.be.undefined;
            expect(column.constructor.name).to.eql("Column");
        });

        it("add the column when the box parent is a row and is  passed column as a type when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            await row.addColumn({ type: "column" });
            await workspace.refreshReference();

            const allBoxesAfterAdd = workspace.getAllBoxes();
            expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
        });

        it("return the column when the box parent is a row and a children array is passed when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            const column = await row.addColumn({ children: [] });

            expect(column).to.not.be.undefined;
            expect(column.constructor.name).to.eql("Column");
        });

        it("add the column when the box parent is a row and a children array is passed when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            await row.addColumn({ children: [] });
            await workspace.refreshReference();

            const allBoxesAfterAdd = workspace.getAllBoxes();
            expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
        });

        it("add the column and update the context of the windows in it when a window definition array is passed with contexts and the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            const firstContext = {
                first: true
            };

            const secondContext = {
                second: true
            };

            const column = await row.addColumn({
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

            await Promise.all(column.children.map((w) => w.forceLoad()));
            await workspace.refreshReference();

            const wait = new Promise((r) => setTimeout(r, 3000));
            await wait;

            await Promise.all(column.children.map(async (w, i) => {
                const glueWin = w.getGdWindow();
                const winContext = await glueWin.getContext();

                if (winContext.first) {
                    expect(winContext).to.eql(firstContext);
                } else if (winContext.second) {
                    expect(winContext).to.eql(secondContext);
                } else {
                    throw new Error(`The window context was not set successfully ${JSON.stringify(winContext)}`);
                }
            }));
        });

        it("return the column when the box parent is a row and is without arguments when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            const column = await row.addColumn();

            expect(column).to.not.be.undefined;
            expect(column.constructor.name).to.eql("Column");
        });

        it("add the column when the box parent is a row and is without arguments when the workspace is not focused", async () => {
            const allBoxes = workspace.getAllBoxes();
            const row = allBoxes.find(p => p.type === "row");
            await row.addColumn();
            await workspace.refreshReference();

            const allBoxesAfterAdd = workspace.getAllBoxes();
            expect(allBoxesAfterAdd.length).to.eql(allBoxes.length + 1);
        });
    });

    it("reject when the box parent is a column and is passed a column definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "column");
        row.addColumn({ type: "column", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    it("reject when the box parent is a group and is passed a column definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "group");
        row.addColumn({ type: "column", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    it("reject when the box parent is a row and the arguments is a row definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        row.addColumn({ type: "row", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    it("reject when the box parent is a row and the arguments is a group definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        row.addColumn({ type: "group", children: [] }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    it("reject when the box parent is a row and the arguments is a window definition", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const row = allBoxes.find(p => p.type === "row");
        row.addColumn({ type: "window" }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    it("reject when there is a maximized window in the workspace", (done) => {
        const allBoxes = workspace.getAllBoxes();
        const window = workspace.getAllWindows()[0];
        const row = allBoxes.find(p => p.type === "row");
        window.maximize().then(() => {
            return row.addColumn({ type: "column", children: [] });
        }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    Array.from(["row", "column", "group"]).forEach((maximizedParentType) => {
        it(`reject when there is a maximized ${maximizedParentType} in the workspace`, (done) => {
            const allBoxes = workspace.getAllBoxes();
            const parent = allBoxes.find(b => b.type === maximizedParentType);
            const row = allBoxes.find(p => p.type === "row");
            parent.maximize().then(() => {
                return row.addColumn({ type: "column", children: [] });
            }).then(() => {
                done("Should not resolve");
            }).catch(() => done());
        });
    });
});
