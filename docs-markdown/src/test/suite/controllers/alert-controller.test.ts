import * as chai from "chai";
import * as spies from "chai-spies";
import { resolve } from "path";
import { window, commands } from "vscode";
import { insertAlert, insertAlertCommand } from "../../../controllers/alert-controller";
import * as common from "../../../helper/common";
import { sleep, loadDocumentAndGetItReady } from "../../test.common/common";
import * as telemetry from "../../../helper/telemetry";

chai.use(spies);

const sinon = require("sinon");

const expect = chai.expect;

suite("Alert Controller", () => {
    // Reset and tear down the spies
    teardown(() => {
        chai.spy.restore(common);
    });
    suiteTeardown(async () => {
        await commands.executeCommand('workbench.action.closeAllEditors');
    });

    test("insertAlertCommand", () => {
        const controllerCommands = [
            { command: insertAlert.name, callback: insertAlert },
        ];
        expect(insertAlertCommand()).to.deep.equal(controllerCommands);
    });
    test("noActiveEditorMessage", () => {
        const spy = chai.spy.on(common, "noActiveEditorMessage");
        insertAlert();
        expect(spy).to.have.been.called();
    });
    test("isMarkdownFileCheck", async () => {
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/docs-markdown.md");
        await loadDocumentAndGetItReady(filePath);

        const spy = chai.spy.on(common, "isMarkdownFileCheck");
        insertAlert();
        await sleep(300);
        expect(spy).to.have.been.called();
    });
    test("insertContentToEditor - Note", async () => {
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/docs-markdown.md");
        await loadDocumentAndGetItReady(filePath);

        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve("Note – Information the user should notice even if skimming") as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData")
        const spy = chai.spy.on(common, "insertContentToEditor");
        insertAlert();
        await sleep(500);
        expect(spy).to.have.been.called();
        stub.restore();
    });

});