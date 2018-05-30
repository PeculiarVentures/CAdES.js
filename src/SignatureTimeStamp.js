import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import { getCrypto, ContentInfo, TSTInfo, SignedData, Attribute, TimeStampResp } from "pkijs";
//**************************************************************************************
// noinspection JSUnusedGlobalSymbols
export default class SignatureTimeStamp extends ContentInfo
{
	//**********************************************************************************
	/**
	 * Constructor for SignatureTimeStamp class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		super(parameters);
		
		//region Internal properties of the object
		if("tspResponse" in parameters)
			/**
			 * @type {ArrayBuffer}
			 * @description tspResponse
			 */
			this.tspResponse = getParametersValue(parameters, "tspResponse", SignatureTimeStamp.defaultValues("tspResponse"));

		if("tstInfo" in parameters)
			/**
			 * @type {TSTInfo}
			 * @description tstInfo
			 */
			this.tstInfo = getParametersValue(parameters, "tstInfo", SignatureTimeStamp.defaultValues("tstInfo"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		super.fromSchema(schema);
		
		//region Check "contentType"
		if(this.contentType !== "1.2.840.113549.1.7.2") // signedData
			throw new Error("Object's schema was not verified against input data for SignatureTimeStamp");
		//endregion
		
		//region Get internal "CMS_SIGNED_DATA"
		const cmsSigned = new SignedData({ schema: this.content });
		//endregion
		
		//region Get internal TST_INFO
		if(cmsSigned.encapContentInfo.eContentType !== "1.2.840.113549.1.9.16.1.4")
			throw new Error("Incorrect format for SignatureTimeStamp");
		
		if(("eContent" in cmsSigned.encapContentInfo) === false)
			throw new Error("Incorrect format for SignatureTimeStamp");
		
		if((cmsSigned.encapContentInfo.eContent instanceof asn1js.OctetString) === false)
			throw new Error("Incorrect format for SignatureTimeStamp");
		
		const asn1 = asn1js.fromBER(cmsSigned.encapContentInfo.eContent.valueBlock.valueHex);
		this.tstInfo = new TSTInfo({ schema: asn1.result });
		//endregion
	}
	//**********************************************************************************
	// noinspection JSUnusedGlobalSymbols
	/**
	 * Get "ArrayBuffer" to transfer to time-stamp server
	 * @param {SignedData} cmsSignedData CMS Signed Data to make attribute for
	 * @param {number} signerIndex Index of signer to make attribute for
	 * @param {Object} parameters Additional parameters for making attribute
	 * @returns {Promise}
	 */
	getStampingBuffer(cmsSignedData, signerIndex, parameters)
	{
		//region Initial variables
		let hashAlgorithm = "SHA-256";
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Check input parameters
		if("hashAlgorithm" in parameters)
			hashAlgorithm = parameters.hashAlgorithm;
		//endregion
		
		return Promise.resolve().then(
			() => crypto.digest({ name: hashAlgorithm }, cmsSignedData.signerInfos[signerIndex].signature.valueBlock.valueHex),
			error => Promise.reject(error)
		);
	}
	//**********************************************************************************
	/**
	 * Create "signature-time-stamp" CAdES attribute
	 * @param {Object} [parameters] Additional parameters for making attribute
	 * @returns {Attribute}
	 */
	makeAttribute(parameters = {})
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
				throw new Error("Parameter \"tspResponse\" is mandatory for making \"signature-time-stamp\" attribute");
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
			type: "1.2.840.113549.1.9.16.2.14",
			values: [
				this.toSchema()
			]
		});
		//endregion
	}
	//**********************************************************************************
}
//**************************************************************************************
