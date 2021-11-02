describe("waitForFrame() Should", () => {
    const basicConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "window",
                        appName: "dummyApp"
                    }
                ]
            }
        ],
        frame: {
            newFrame: true
        }
    }
    before(() => coreReady);

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((frame) => frame.close()));
    });

    // TODO: Write a test which waits for the frame before it is added to the API
    
    it("return the correct frame when the frame has already been loaded and there are multiple frames opened", async () => {
        const workspace1 = await glue.workspaces.createWorkspace(basicConfig);
        const workspace2 = await glue.workspaces.createWorkspace(basicConfig);
        const workspace3 = await glue.workspaces.createWorkspace(basicConfig);

        const frame1AfterWaiting = await glue.workspaces.waitForFrame(workspace1.frame.id);
        const frame2AfterWaiting = await glue.workspaces.waitForFrame(workspace2.frame.id);
        const frame3AfterWaiting = await glue.workspaces.waitForFrame(workspace3.frame.id);

        expect(workspace1.frame.id).to.eql(frame1AfterWaiting.id);
        expect(workspace2.frame.id).to.eql(frame2AfterWaiting.id);
        expect(workspace3.frame.id).to.eql(frame3AfterWaiting.id);
    });

    Array.from([null, undefined, "", 42, [], {}]).forEach((input) => {
        it(`reject when a ${typeof input} is passed`, (done) => {
            glue.workspaces.waitForFrame(input).then(() => {
                done("Should not resolve");
            }).catch(() => {
                done();
            });
        });
    });
});