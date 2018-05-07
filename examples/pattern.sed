import { CryptoEngine } from "pkijs";

const WebCrypto = require("node-webcrypto-ossl");
const webcrypto = new WebCrypto();

const assert = require("assert");
setEngine("newEngine", webcrypto, new CryptoEngine({ name: "", crypto: webcrypto, subtle: webcrypto.subtle }));
