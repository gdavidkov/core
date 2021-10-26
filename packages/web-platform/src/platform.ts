/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42WebPlatform } from "../platform";
import { extensionEnvironmentDecoder, platformConfigDecoder } from "./shared/decoders";
import { defaultPlatformConfig } from "./common/defaultConfig";
import deepMerge from "deepmerge";
import { version } from "../package.json";
import { PlatformController } from "./controllers/main";
import { Glue42Web } from "@glue42/web";
import { InternalPlatformConfig } from "./common/types";

export class Platform {

    private platformConfig!: InternalPlatformConfig;

    constructor(
        private readonly controller: PlatformController,
        config?: Glue42WebPlatform.Config,
    ) {
        this.checkSingleton();
        this.processConfig(config);
    }

    public async ready(): Promise<void> {
        await this.controller.start(this.platformConfig);
    }

    public getClientGlue(): Glue42Web.API {
        return this.controller.getClientGlue();
    }

    public exposeAPI(): Glue42WebPlatform.API {
        return {
            version: this.version
        };
    }

    private get version(): string {
        return version;
    }

    private checkSingleton(): void {
        const glue42CoreNamespace = (window as any).glue42core;

        if (glue42CoreNamespace && glue42CoreNamespace.platformStarted) {
            throw new Error("The Glue42 Core Platform has already been started for this application.");
        }
    }

    private processConfig(config: Glue42WebPlatform.Config = {}): void {
        const verifiedConfig = platformConfigDecoder.runWithException(config);

        const currentProtocol = (new URL(window.location.href)).protocol;

        if (currentProtocol.includes("extension")) {
            extensionEnvironmentDecoder.runWithException(verifiedConfig.environment?.extension);
        }

        this.validatePlugins(verifiedConfig);

        this.platformConfig = deepMerge<InternalPlatformConfig>(defaultPlatformConfig, verifiedConfig as any);

        // deep merge deletes the promise object when merging, probably due to some cyclical references 
        this.transferPromiseObjects(verifiedConfig);

        const glue42core = {
            platformStarted: true,
            isPlatformFrame: !!config?.workspaces?.isFrame,
            environment: this.platformConfig.environment,
            workspacesFrameCache: typeof config.workspaces?.frameCache === "boolean" ? config.workspaces?.frameCache : true
        };

        (window as any).glue42core = glue42core;
    }

    private transferPromiseObjects(verifiedConfig: Glue42WebPlatform.Config): void {
        if (verifiedConfig.serviceWorker?.registrationPromise) {
            (this.platformConfig.serviceWorker as Glue42WebPlatform.ServiceWorker.Config).registrationPromise = verifiedConfig.serviceWorker.registrationPromise;
        }

        if (verifiedConfig.plugins && verifiedConfig.plugins.definitions.length) {
            const definitions = verifiedConfig.plugins.definitions;

            definitions.forEach((def) => {
                const found = this.platformConfig.plugins?.definitions.find((savedDef) => savedDef.name === def.name);

                if (found) {
                    found.config = def.config;
                }
            });
        }
    }

    private validatePlugins(verifiedConfig: Glue42WebPlatform.Config): void {

        if (verifiedConfig.plugins?.definitions) {

            const badDefinitions = verifiedConfig.plugins.definitions.reduce<Array<{ name: string; startType: string }>>((soFar, definition) => {
                const startType = typeof definition.start;
                const name = definition.name;

                if (startType !== "function") {
                    soFar.push({ name, startType });
                }

                return soFar;
            }, []);

            if (badDefinitions.length) {
                const errorStack = badDefinitions
                    .map((def) => `The start function for plugin ${def.name} was expected to be of type function, but was provided: ${def.startType}`)
                    .join("\n");
                throw new Error(errorStack);
            }
        }
    }
}
