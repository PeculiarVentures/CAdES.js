import * as asn1js from "asn1js";
import { getParametersValue, utilConcatBuf } from "pvutils";
import {
	getCrypto,
	ContentInfo,
	Attribute,
	TimeStampResp
} from "pkijs";
//**************************************************************************************
// noinspection JSUnusedGlobalSymbols
export default class CAdESCTimestamp extends ContentInfo
{
	//**********************************************************************************
	/**
	 * Constructor for CAdESCTimestamp class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		super(parameters);
		
		/**
		 * @type {ArrayBuffer}
		 * @description tspResponse
		 */
		this.tspResponse = getParametersValue(parameters, "tspResponse", new ArrayBuffer(0));
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols
	/**
	 * Get "ArrayBuffer" to transfer to time-stamp server
	 * @param {SignedData} cmsSignedData CMS Signed Data to make attribute for
	 * @param {number} signerIndex Index of signer to make attribute for
	 * @param {Object} [parameters] Additional parameters for making attribute
	 * @returns {Promise}
	 */
	getStampingBuffer(cmsSignedData, signerIndex, parameters = {})
	{
		//region Initial variables
		let sequence = Promise.resolve();
		
		let hashAlgorithm = "SHA-256";
		
		let resultBuffer = new ArrayBuffer(0);
		
		let signatureTimeStamp; // SignatureTimeStamp
		let completeCertificateReferences; // CompleteCertificateReferences
		let completeRevocationReferences; // CompleteRevocationReferences
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Check input parameters
		if("hashAlgorithm" in parameters)
			hashAlgorithm = parameters.hashAlgorithm;
		
		if("signatureTimeStamp" in parameters)
			signatureTimeStamp = parameters.signatureTimeStamp;
		else
			return Promise.reject("Parameter \"signatureTimeStamp\" is mandatory for making \"CAdES-C-Timestamp\" attribute");
		
		if("completeCertificateReferences" in parameters)
			completeCertificateReferences = parameters.completeCertificateReferences;
		else
			return Promise.reject("Parameter \"completeCertificateReferences\" is mandatory for making \"CAdES-C-Timestamp\" attribute");
		
		if("completeRevocationReferences" in parameters)
			completeRevocationReferences = parameters.completeRevocationReferences;
		else
			return Promise.reject("Parameter \"completeRevocationReferences\" is mandatory for making \"CAdES-C-Timestamp\" attribute");
		//endregion
		
		//region Make stamping buffer
		sequence = sequence.then(
			() => {
				resultBuffer = utilConcatBuf(resultBuffer, cmsSignedData.signerInfos[signerIndex].signature.valueBlock.valueHex);
				resultBuffer = utilConcatBuf(resultBuffer, signatureTimeStamp.makeAttribute().toSchema().toBER(false));
				resultBuffer = utilConcatBuf(resultBuffer, completeCertificateReferences.makeAttribute().toSchema().toBER(false));
				resultBuffer = utilConcatBuf(resultBuffer, completeRevocationReferences.makeAttribute().toSchema().toBER(false));
			},
			error => Promise.reject(error)
		);
		//endregion
		
		//region Make hash of signature
		sequence = sequence.then(
			() => crypto.digest({ name: hashAlgorithm }, resultBuffer),
			error => Promise.reject(error)
		);
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
	/**
	 * Create "CAdES-C-Timestamp" CAdES attribute
	 * @param {Object} parameters Additional parameters for making attribute
	 * @returns {Attribute}
	 */
	makeAttribute(parameters)
	{
		//region Initial variables
		let tspResponse;
		//endregion
		
		//region Check input parameters
		if("tspResponse" in parameters)
			tspResponse = parameters.tspResponse;
		else
		{
			if("tspResponse" in this)
				tspResponse = this.tspResponse;
			else
				throw new Error("Parameter \"tspResponse\" is mandatory for making \"CAdES-C-Timestamp\" attribute");
		}
		
		this.tspResponse = tspResponse;
		//endregion
		
		//region Change type of "tspResponse"
		const asn1 = asn1js.fromBER(tspResponse);
		tspResponse = new TimeStampResp({ schema: asn1.result });
		//endregion
		
		//region Initialize internal variables from "tspResponse"
		if("timeStampToken" in tspResponse)
			this.fromSchema(tspResponse.timeStampToken.toSchema());
		else
			throw new Error("No neccessary \"timeStampToken\" inside \"tspResponse\"");
		//endregion
		
		//region Create and return attribute
		return new Attribute({
			type: "1.2.840.113549.1.9.16.2.25",
			values: [
				this.toSchema()
			]
		});
		//endregion
	}
	//**********************************************************************************
}
//**************************************************************************************
