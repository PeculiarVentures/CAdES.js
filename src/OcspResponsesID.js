import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import { getCrypto, getOIDByAlgorithm, AlgorithmIdentifier } from "pkijs";
import OcspIdentifier from "./OcspIdentifier.js";
import OtherHashAlgAndValue from "./OtherHashAlgAndValue.js";
//**************************************************************************************
export default class OcspResponsesID
{
	//**********************************************************************************
	/**
	 * Constructor for OcspResponsesID class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {OcspIdentifier}
		 * @description ocspIdentifier
		 */
		this.ocspIdentifier = getParametersValue(parameters, "ocspIdentifier", OcspResponsesID.defaultValues("ocspIdentifier"));
		
		if("ocspRepHash" in parameters)
			/**
			 * @type {OctetString|OtherHashAlgAndValue|Any}
			 * @description ocspRepHash
			 */
			this.ocspRepHash = getParametersValue(parameters, "ocspRepHash", OcspResponsesID.defaultValues("ocspRepHash"));
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
			case "ocspIdentifier":
				return new OcspIdentifier();
			case "ocspRepHash":
				return new asn1js.Any();
			default:
				throw new Error(`Invalid member name for OcspResponsesID class: ${memberName}`);
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
			case "ocspIdentifier":
				return ((OcspIdentifier.compareWithDefault("ocspResponderID", memberValue.ocspResponderID)) &&
						(OcspIdentifier.compareWithDefault("producedAt", memberValue.producedAt)));
			case "ocspRepHash":
				return (memberValue instanceof asn1js.Any);
			default:
				throw new Error(`Invalid member name for OcspResponsesID class: ${memberName}`);
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
		//OcspResponsesID ::= SEQUENCE {
		//    ocspIdentifier OcspIdentifier,
		//    ocspRepHash OtherHash OPTIONAL
		//}
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [ocspIdentifier]
		 * @property {string} [ocspRepHashSimple]
		 * @property {string} [ocspRepHashComplex]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			optional: (names.optional || false),
			value: [
				OcspIdentifier.schema(names.ocspIdentifier || {
					names: {
						blockName: ""
					}
				}),
				new asn1js.Choice({
					optional: true,
					value: [
						new asn1js.OctetString({ name: (names.ocspRepHashSimple || "") }),
						OtherHashAlgAndValue.schema(names.ocspRepHashComplex || {
							names: {
								blockName: ""
							}
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
			OcspResponsesID.schema({
				names: {
					ocspIdentifier: {
						names: {
							blockName: "ocspIdentifier"
						}
					},
					ocspRepHashSimple: "ocspRepHash",
					ocspRepHashComplex: {
						names: {
							blockName: "ocspRepHash"
						}
					}
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OcspResponsesID");
		//endregion
		
		//region Get internal properties from parsed schema
		this.ocspIdentifier = new OcspIdentifier({ schema: asn1.result.ocspIdentifier });
		
		if("ocspRepHash" in asn1.result)
		{
			if(asn1.result.ocspRepHash instanceof asn1js.OctetString)
				this.ocspRepHash = asn1.result.ocspRepHash;
			else
				this.ocspRepHash = new OtherHashAlgAndValue({ schema: asn1.result.ocspRepHash });
		}
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
		const outputArray = [
			this.ocspIdentifier.toSchema()
		];
		
		if("ocspRepHash" in this)
		{
			if(this.ocspRepHash instanceof asn1js.OctetString)
				outputArray.push(this.ocspRepHash);
			else
				outputArray.push(this.ocspRepHash.toSchema());
		}
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
		const _object = {
			ocspIdentifier: this.ocspIdentifier.toJSON()
		};
		
		if("ocspRepHash" in this)
			_object.ocspRepHash = this.ocspRepHash.toJSON();
		
		return _object;
	}
	//**********************************************************************************
	/**
	 * Creates "OcspResponsesID" for given CMS Signed Data and signer index
	 * @param {Object} parameters Additional parameters for making attribute
	 * @returns {Promise}
	 */
	fillValues(parameters)
	{
		//region Initial variables
		let sequence = Promise.resolve();
		
		let hashAlgorithm = "SHA-1";
		
		let ocspResponse;
		//endregion
		
		//region Check input parameters
		if("hashAlgorithm" in parameters)
			hashAlgorithm = parameters.hashAlgorithm;
		
		if("ocspResponse" in parameters)
			ocspResponse = parameters.ocspResponse; // in_window.org.pkijs.simpl.OCSP_RESPONSE
		else
			return Promise.reject("Parameter \"ocspResponse\" is mandatory for making \"OcspResponsesID\"");
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Fill correct value for "hashIndAlgorithm"
		sequence = sequence.then(
			() => {
				if(hashAlgorithm.toUpperCase() !== "SHA-1")
				{
					const oid = getOIDByAlgorithm({ name: hashAlgorithm });
					if(oid === "")
						return Promise.reject(`Incorrect hashing algorithm: ${hashAlgorithm}`);
					
					this.ocspRepHash = new OtherHashAlgAndValue({
						hashAlgorithm: new AlgorithmIdentifier({
							algorithmId: oid,
							algorithmParams: new asn1js.Null()
						})
					});
				}
				
				return Promise.resolve();
			}
		);
		//endregion
		
		//region Create all remaining attributes
		sequence = sequence.then(
			() => crypto.digest({ name: hashAlgorithm }, ocspResponse.toSchema().toBER(false)),
			error => Promise.reject(error)
		).then(
			result => {
				if(this.ocspRepHash instanceof OtherHashAlgAndValue)
					this.ocspRepHash.hashValue = new asn1js.OctetString({ valueHex: result });
				else
					this.ocspRepHash = new asn1js.OctetString({ valueHex: result });
				
				this.ocspIdentifier = new OcspIdentifier();
				this.ocspIdentifier.fillValues({
					ocspResponse
				});
			},
			error => Promise.reject(error)
		);
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
}
//**************************************************************************************
