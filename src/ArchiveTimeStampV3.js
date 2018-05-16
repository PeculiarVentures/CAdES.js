import * as asn1js from "asn1js";
import { getParametersValue, utilConcatBuf } from "pvutils";
import { getCrypto, ContentInfo, SignedData, IssuerAndSerialNumber, Attribute, TimeStampResp, SignedAndUnsignedAttributes } from "pkijs";
import ATSHashIndex from "./ATSHashIndex.js";
//**************************************************************************************
// noinspection JSUnusedGlobalSymbols
export default class ArchiveTimeStampV3 extends ContentInfo
{
	//**********************************************************************************
	/**
	 * Constructor for ArchiveTimeStampV3 class
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
			this.tspResponse = getParametersValue(parameters, "tspResponse", ArchiveTimeStampV3.defaultValues("tspResponse"));
		
		/**
		 * @type {ATSHashIndex}
		 * @description aTSHashIndex
		 */
		this.aTSHashIndex = getParametersValue(parameters, "aTSHashIndex", ArchiveTimeStampV3.defaultValues("aTSHashIndex"));
		//endregion
		
		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "tspResponse":
				return new ArrayBuffer(0);
			case "aTSHashIndex":
				return new ATSHashIndex();
			default:
				throw new Error(`Invalid member name for ArchiveTimeStampV3 class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "tspResponse":
				return (memberValue.byteLength === 0);
			case "aTSHashIndex":
				// noinspection OverlyComplexBooleanExpressionJS
				return ((("hashIndAlgorithm" in memberValue) === false) &&
						(ATSHashIndex.compareWithDefault("certificatesHashIndex", memberValue.certificatesHashIndex)) &&
						(ATSHashIndex.compareWithDefault("crlsHashIndex", memberValue.crlsHashIndex)) &&
						(ATSHashIndex.compareWithDefault("unsignedAttrsHashIndex", memberValue.unsignedAttrsHashIndex)));
			default:
				throw new Error(`Invalid member name for ArchiveTimeStampV3 class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 * @param {boolean} [initValues=true]
	 */
	fromSchema(schema, initValues = true)
	{
		super.fromSchema(schema);
		
		if(initValues)
		{
			if(this.contentType !== "1.2.840.113549.1.7.2")
				throw new Error("Incorrect object schema for archive-time-stamp-v3 attribute: incorrect content type");
			
			this.tspResponse = new TimeStampResp({ timeStampToken: schema });
			
			const cmsSignedData = new SignedData({ schema: this.content });
			
			if(cmsSignedData.signerInfos.length !== 1)
				throw new Error("Incorrect object schema for archive-time-stamp-v3 attribute: incorrect signerInfos length");
			
			if(("unsignedAttrs" in cmsSignedData.signerInfos[0]) === false)
				throw new Error("Incorrect object schema for archive-time-stamp-v3 attribute: missing unsignedAttrs");
			
			if(cmsSignedData.signerInfos[0].unsignedAttrs.attributes.length !== 1)
				throw new Error("Incorrect object schema for archive-time-stamp-v3 attribute: incorrect unsignedAttrs length");
			
			const attribute = new Attribute(cmsSignedData.signerInfos[0].unsignedAttrs.attributes[0]);
			
			if(attribute.type !== "0.4.0.1733.2.5")
				throw new Error("Incorrect object schema for archive-time-stamp-v3 attribute: incorrect type for aTSHashIndex value");
			
			let parsedValue;
			
			try
			{
				parsedValue = new ATSHashIndex({ schema: attribute.values[0] });
			}
			catch(e)
			{
				throw new Error("Incorrect object schema for archive-time-stamp-v3 attribute: incorrect aTSHashIndex value");
			}
			
			this.aTSHashIndex = parsedValue;
		}
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
		let sequence = Promise.resolve();
		
		let hashAlgorithm = "SHA-256";
		
		let content = new ArrayBuffer(0);
		let aTSHashIndex = new ArrayBuffer(0);
		
		let resultBuffer = new ArrayBuffer(0);
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Check input parameters
		if("hashAlgorithm" in parameters)
			hashAlgorithm = parameters.hashAlgorithm;
		
		if("content" in parameters)
			content = parameters.content; // ArrayBuffer
		else
		{
			if("eContent" in cmsSignedData.encapContentInfo)
			{
				if((cmsSignedData.encapContentInfo.eContent.idBlock.tagClass === 1) &&
					(cmsSignedData.encapContentInfo.eContent.idBlock.tagNumber === 4))
				{
					if(cmsSignedData.encapContentInfo.eContent.idBlock.isConstructed === false)
						content = cmsSignedData.encapContentInfo.eContent.valueBlock.valueHex;
					else
					{
						for(let i = 0; i < cmsSignedData.encapContentInfo.eContent.valueBlock.value.length; i++)
							content = utilConcatBuf(content, cmsSignedData.encapContentInfo.eContent.valueBlock.value[i].valueBlock.valueHex);
					}
				}
				else
					content = cmsSignedData.encapContentInfo.eContent.valueBlock.valueHex;
			}
			else
				return Promise.reject("Parameter \"content\" is mandatory for making archive-time-stamp-v3");
		}
		
		if("aTSHashIndex" in parameters)
			aTSHashIndex = parameters.aTSHashIndex; // ArrayBuffer
		else
			return Promise.reject("Parameter \"aTSHashIndex\" is mandatory for making archive-time-stamp-v3");
		//endregion
		
		//region Make hash of initial content
		sequence = sequence.then(
			() => crypto.digest({ name: hashAlgorithm }, content),
			error => Promise.reject(error)
		);
		//endregion
		
		//region Make final stamping buffer
		sequence = sequence.then(
			result => {
				//region eContentType
				const contentOID = new asn1js.ObjectIdentifier({ value: cmsSignedData.encapContentInfo.eContentType });
				resultBuffer = utilConcatBuf(resultBuffer, contentOID.toBER(false));
				//endregion
				
				//region message-digest
				// noinspection JSCheckFunctionSignatures
				resultBuffer = utilConcatBuf(resultBuffer, result);
				//endregion
				
				//region version
				const version = new asn1js.Integer({ value: cmsSignedData.signerInfos[signerIndex].version });
				resultBuffer = utilConcatBuf(resultBuffer, version.toBER(false));
				//endregion
				
				//region sid
				let sid;
				
				if(cmsSignedData.signerInfos[signerIndex].sid instanceof IssuerAndSerialNumber)
					sid = cmsSignedData.signerInfos[signerIndex].sid.toSchema();
				else
					sid = cmsSignedData.signerInfos[signerIndex].sid;
				
				resultBuffer = utilConcatBuf(resultBuffer, sid.toBER(false));
				//endregion
				
				//region digestAlgorithm
				resultBuffer = utilConcatBuf(resultBuffer, cmsSignedData.signerInfos[signerIndex].digestAlgorithm.toSchema().toBER(false));
				//endregion
				
				//region signedAttrs
				if("signedAttrs" in cmsSignedData.signerInfos[signerIndex])
					resultBuffer = utilConcatBuf(resultBuffer, cmsSignedData.signerInfos[signerIndex].signedAttrs.toSchema().toBER(false));
				else
					return Promise.reject("Must be \"signedAttrs\" inside SignerInfo structure. Check correctness of the signed data.");
				//endregion
				
				//region signatureAlgorithm
				resultBuffer = utilConcatBuf(resultBuffer, cmsSignedData.signerInfos[signerIndex].signatureAlgorithm.toSchema().toBER(false));
				//endregion
				
				//region signature
				resultBuffer = utilConcatBuf(resultBuffer, cmsSignedData.signerInfos[signerIndex].signature.toBER(false));
				//endregion
				
				//region ATSHashIndexV2
				resultBuffer = utilConcatBuf(resultBuffer, aTSHashIndex);
				//endregion
				
				return resultBuffer;
			},
			error => Promise.reject(error)
		);
		//endregion
		
		//region Make hash of result buffer
		sequence = sequence.then(
			result => crypto.digest({ name: hashAlgorithm }, result),
			error => Promise.reject(error)
		);
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
	/**
	 * Create "archive-time-stamp-v3" CAdES attribute
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
				throw new Error("Parameter \"tspResponse\" is mandatory for making archive-time-stamp-v3 attribute");
		}
		
		this.tspResponse = tspResponse;
		//endregion
		
		//region Change type of "tspResponse"
		const asn1 = asn1js.fromBER(tspResponse);
		tspResponse = new TimeStampResp({ schema: asn1.result });
		//endregion
		
		//region Initialize internal variables from "tspResponse"
		if("timeStampToken" in tspResponse)
			this.fromSchema(tspResponse.timeStampToken.toSchema(), false);
		else
			throw new Error("No neccessary \"timeStampToken\" inside \"tspResponse\"");
		//endregion
		
		//region Append "ATSHashIndex" into local unsigned attributes
		const cmsSignedData = new SignedData({ schema: this.content });
		
		cmsSignedData.signerInfos[0].unsignedAttrs = new SignedAndUnsignedAttributes({
			type: 1, // UnsignedAttributes
			attributes: [
				this.aTSHashIndex.makeAttribute()
			]
		});
		
		this.content = cmsSignedData.toSchema();
		//endregion
		
		//region Create and return attribute
		return new Attribute({
			type: "0.4.0.1733.2.4",
			values: [
				this.toSchema()
			]
		});
		//endregion
	}
	//**********************************************************************************
}
//**************************************************************************************
