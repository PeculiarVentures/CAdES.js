import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import { getCrypto, getOIDByAlgorithm, AlgorithmIdentifier, OtherCertificateFormat, OtherRevocationInfoFormat, Attribute } from "pkijs";
//**************************************************************************************
export default class ATSHashIndex
{
	//**********************************************************************************
	/**
	 * Constructor for ATSHashIndex class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("hashIndAlgorithm" in parameters)
			/**
			 * @type {AlgorithmIdentifier}
			 * @description hashIndAlgorithm
			 */
			this.hashIndAlgorithm = getParametersValue(parameters, "hashIndAlgorithm", ATSHashIndex.defaultValues("hashIndAlgorithm"));
		
		/**
		 * @type {Array.<OctetString>}
		 * @description certificatesHashIndex
		 */
		this.certificatesHashIndex = getParametersValue(parameters, "certificatesHashIndex", ATSHashIndex.defaultValues("certificatesHashIndex"));
		/**
		 * @type {Array.<OctetString>}
		 * @description crlsHashIndex
		 */
		this.crlsHashIndex = getParametersValue(parameters, "crlsHashIndex", ATSHashIndex.defaultValues("crlsHashIndex"));
		/**
		 * @type {Array.<OctetString>}
		 * @description unsignedAttrsHashIndex
		 */
		this.unsignedAttrsHashIndex = getParametersValue(parameters, "unsignedAttrsHashIndex", ATSHashIndex.defaultValues("unsignedAttrsHashIndex"));
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
			case "hashIndAlgorithm":
				return new AlgorithmIdentifier();
			case "certificatesHashIndex":
			case "crlsHashIndex":
			case "unsignedAttrsHashIndex":
				return [];
			default:
				throw new Error(`Invalid member name for ATSHashIndex class: ${memberName}`);
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
			case "hashIndAlgorithm":
				return ((AlgorithmIdentifier.compareWithDefault("algorithmId", memberValue.algorithmId)) &&
						(("algorithmParams" in memberValue) === false));
			case "certificatesHashIndex":
			case "crlsHashIndex":
			case "unsignedAttrsHashIndex":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for ATSHashIndex class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		// ATSHashIndex ::= SEQUENCE {
		//    hashIndAlgorithm AlgorithmIdentifier DEFAULT {algorithm id-sha256},
		//    certificatesHashIndex SEQUENCE OF OCTET STRING,
		//    crlsHashIndex SEQUENCE OF OCTET STRING,
		//    unsignedAttrsHashIndex SEQUENCE OF OCTET STRING
		//}
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [hashIndAlgorithm]
		 * @property {string} [certificatesHashIndex]
		 * @property {string} [crlsHashIndex]
		 * @property {string} [unsignedAttrsHashIndex]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				AlgorithmIdentifier.schema(names.hashIndAlgorithm || {
					names: {
						blockName: "",
						optional: true
					}
				}),
				new asn1js.Sequence({
					value: [
						new asn1js.Repeated({
							name: (names.certificatesHashIndex || ""),
							value: new asn1js.OctetString()
						})
					]
				}),
				new asn1js.Sequence({
					value: [
						new asn1js.Repeated({
							name: (names.crlsHashIndex || ""),
							value: new asn1js.OctetString()
						})
					]
				}),
				new asn1js.Sequence({
					value: [
						new asn1js.Repeated({
							name: (names.unsignedAttrsHashIndex || ""),
							value: new asn1js.OctetString()
						})
					]
				})
			]
		}));
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			ATSHashIndex.schema({
				names: {
					hashIndAlgorithm: {
						names: {
							blockName: "hashIndAlgorithm",
							optional: true
						}
					},
					certificatesHashIndex: "certificatesHashIndex",
					crlsHashIndex: "crlsHashIndex",
					unsignedAttrsHashIndex: "unsignedAttrsHashIndex"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for ATSHashIndex");
		//endregion
		
		//region Get internal properties from parsed schema
		//region hashIndAlgorithm
		if("hashIndAlgorithm" in asn1.result)
			this.hashIndAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.hashIndAlgorithm });
		//endregion
		
		//region certificatesHashIndex
		this.certificatesHashIndex = Array.from(asn1.result.certificatesHashIndex || []);
		//endregion
		
		//region crlsHashIndex
		this.crlsHashIndex = Array.from(asn1.result.crlsHashIndex || []);
		//endregion
		
		//region unsignedAttrsHashIndex
		this.unsignedAttrsHashIndex = Array.from(asn1.result.unsignedAttrsHashIndex || []);
		//endregion
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		if("hashIndAlgorithm" in this)
			outputArray.push(this.hashIndAlgorithm.toSchema());
		
		//region certificatesHashIndex
		outputArray.push(new asn1js.Sequence({
			value: Array.from(this.certificatesHashIndex)
		}));
		//endregion
		
		//region crlsHashIndex
		outputArray.push(new asn1js.Sequence({
			value: Array.from(this.crlsHashIndex)
		}));
		//endregion
		
		//region unsignedAttrsHashIndex
		outputArray.push(new asn1js.Sequence({
			value: Array.from(this.unsignedAttrsHashIndex)
		}));
		//endregion
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: outputArray
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {};
		
		if("hashIndAlgorithm" in this)
			_object.hashIndAlgorithm = this.hashIndAlgorithm.toJSON();
		
		//region certificatesHashIndex
		_object.certificatesHashIndex = Array.from(this.certificatesHashIndex, element => element.toJSON());
		//endregion
		
		//region crlsHashIndex
		_object.crlsHashIndex = Array.from(this.crlsHashIndex, element => element.toJSON());
		//endregion
		
		//region unsignedAttrsHashIndex
		_object.unsignedAttrsHashIndex = Array.from(this.unsignedAttrsHashIndex, element => element.toJSON());
		//endregion
		
		return _object;
	}
	//**********************************************************************************
	/**
	 * Creates "ATSHashIndex" for given CMS Signed Data and signer index
	 * @param {SignedData} cmsSigned CMS Signed Data to make attribute for
	 * @param {number} signerIndex Index of signer to make attribute for
	 * @param {Object} parameters Additional parameters for making attribute
	 * @returns {Promise}
	 */
	fillValues(cmsSigned, signerIndex, parameters)
	{
		//region Initial variables
		const _this = this;
		
		let sequence = Promise.resolve();
		
		let hashAlgorithm = "SHA-256";
		//endregion
		
		//region Check input parameters
		if("hashAlgorithm" in parameters)
			hashAlgorithm = parameters.hashAlgorithm;
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Fill correct value for "hashIndAlgorithm"
		sequence = sequence.then(
			() => {
				if(hashAlgorithm.toUpperCase() !== "SHA-256")
				{
					const oid = getOIDByAlgorithm({ name: hashAlgorithm });
					if(oid === "")
						return Promise.reject(`Incorrect hashing algorithm: ${hashAlgorithm}`);
					
					_this.hashIndAlgorithm = new AlgorithmIdentifier({
						algorithmId: oid,
						algorithmParams: new asn1js.Null()
					});
				}
				
				return Promise.resolve();
			}
		);
		//endregion
		
		//region Create array of indexes for all certificates
		sequence = sequence.then(
			() => {
				const promises = [];
				
				if(("certificates" in cmsSigned) === false)
					return promises;
				
				//region Prepare "CertificateChoices" type from existing values
				for(let i = 0; i < cmsSigned.certificates.length; i++)
				{
					const schema = cmsSigned.certificates[i].toSchema();
					
					if(cmsSigned.certificates[i] instanceof OtherCertificateFormat)
					{
						schema.idBlock.tagClass = 3;
						schema.idBlock.tagNumber = 3;
					}
					
					promises.push(crypto.digest({ name: hashAlgorithm }, schema.toBER(false)));
				}
				//endregion
				
				return Promise.all(promises);
			},
			error => Promise.reject(error)
		).then(
			result => {
				for(let i = 0; i < result.length; i++)
					_this.certificatesHashIndex.push(new asn1js.OctetString({ valueHex: result[i] }));
			},
			error => Promise.reject(error)
		);
		//endregion
		
		//region Create array of indexes for all revocation values
		sequence = sequence.then(
			() => {
				const promises = [];
				
				if(("crls" in cmsSigned) === false)
					return promises;
				
				//region Prepare "RevocationInfoChoice" type from existing values
				for(let i = 0; i < cmsSigned.crls.length; i++)
				{
					const schema = cmsSigned.crls[i].toSchema();
					
					if(cmsSigned.crls[i] instanceof OtherRevocationInfoFormat)
					{
						schema.idBlock.tagClass = 3;
						schema.idBlock.tagNumber = 1;
					}
					
					promises.push(crypto.digest({ name: hashAlgorithm }, schema.toBER(false)));
				}
				//endregion
				
				return Promise.all(promises);
			},
			error => Promise.reject(error)
		).then(
			result => {
				for(let i = 0; i < result.length; i++)
					_this.crlsHashIndex.push(new asn1js.OctetString({ valueHex: result[i] }));
			},
			error => Promise.reject(error)
		);
		//endregion
		
		//region Create array of indexes for unsigned attributes
		sequence = sequence.then(
			() => {
				const promises = [];
				
				if(("unsignedAttrs" in cmsSigned.signerInfos[signerIndex]) === false)
					return promises;
				
				//region Prepare "RevocationInfoChoice" type from existing values
				for(let i = 0; i < cmsSigned.signerInfos[signerIndex].unsignedAttrs.length; i++)
					promises.push(crypto.digest({ name: hashAlgorithm }, cmsSigned.signerInfos[signerIndex].unsignedAttrs[i].toSchema().toBER(false)));
				//endregion
				
				return Promise.all(promises);
			},
			error => Promise.reject(error)
		).then(
			result => {
				for(let i = 0; i < result.length; i++)
					_this.unsignedAttrsHashIndex.push(new asn1js.OctetString({ valueHex: result[i] }));
			},
			error => Promise.reject(error)
		);
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
	/**
	 * Create "ATSHashIndex" CAdES attribute
	 * @param {Object} [parameters] Additional parameters for making attribute
	 * @returns {Attribute}
	 */
	makeAttribute(parameters = {})
	{
		//region Create and return attribute
		return new Attribute({
			type: "0.4.0.1733.2.5",
			values: [
				this.toSchema()
			]
		});
		//endregion
	}
	//**********************************************************************************
}
//**************************************************************************************
