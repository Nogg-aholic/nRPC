/// <reference types="node" />

import path from "node:path";
import { fileURLToPath } from "node:url";

import { writeMdDocsToDisk } from "../../nrpc-cli/src/md-docs-generator.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.join(currentDir, "..");
const srcDir = path.join(packageDir, "src");
const entryFile = path.join(srcDir, "index.ts");

writeMdDocsToDisk({
  entryFile,
  rootType: "NrpcNamespace",
  outputDir: path.join(currentDir, "..", "docs", "generated"),
  includeImplementation: true,
  includeExternalDeps: false,
});


console.log("Generated nRPC Markdown docs at", path.join(currentDir, "..", "docs", "generated"));
