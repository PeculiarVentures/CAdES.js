import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import { getCrypto, getOIDByAlgorithm, AlgorithmIdentifier } from "pkijs";
import OtherHashAlgAndValue from "./OtherHashAlgAndValue.js";
import CrlIdentifier from "./CrlIdentifier.js";
//**************************************************************************************
export default class CrlValidatedID
{
	//**********************************************************************************
	/**
	 * Constructor for CrlValidatedID class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {OctetString|OtherHashAlgAndValue}
		 * @description crlHash
		 */
		this.crlHash = getParametersValue(parameters, "crlHash", CrlValidatedID.defaultValues("crlHash"));
		
		this._crlHashType = (-1); // 0 - OCTETSTRING, 1 - "OtherHashAlgAndValue"
		
		if("crlIdentifier" in parameters)
			/**
			 * @type {CrlIdentifier}
			 * @description crlIdentifier
			 */
			this.crlIdentifier = getParametersValue(parameters, "crlIdentifier", CrlValidatedID.defaultValues("crlIdentifier"));
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
			case "crlHash":
				return new asn1js.Any();
			case "crlIdentifier":
				return new CrlIdentifier();
			default:
				throw new Error(`Invalid member name for CrlValidatedID class: ${memberName}`);
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
			case "crlHash":
				return (memberValue instanceof asn1js.Any);
			case "crlIdentifier":
				return ((CrlIdentifier.compareWithDefault("crlissuer", memberValue.crlissuer)) &&
						(CrlIdentifier.compareWithDefault("crlIssuedTime", memberValue.crlIssuedTime)) &&
						(("crlNumber" in memberValue) === false));
			default:
				throw new Error(`Invalid member name for CrlValidatedID class: ${memberName}`);
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
		// CrlValidatedID ::= SEQUENCE {
		//    crlHash OtherHash,
		//    crlIdentifier CrlIdentifier OPTIONAL }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [crlHashSimple]
		 * @property {string} [crlHashComplex]
		 * @property {string} [crlIdentifier]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			optional: (names.optional || false),
			value: [
				new asn1js.Choice({
					value: [
						new asn1js.OctetString({ name: (names.crlHashSimple || "") }),
						OtherHashAlgAndValue.schema(names.crlHashComplex || {
							names: {
								blockName: ""
							}
						})
					]
				}),
				CrlIdentifier.schema(names.crlIdentifier || {
					names: {
						blockName: ""
					}
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
			CrlValidatedID.schema({
				names: {
					crlHashSimple: "crlHash",
					crlHashComplex: {
						names: {
							blockName: "crlHash"
						}
					},
					crlIdentifier: {
						names: {
							blockName: "crlIdentifier"
						}
					}
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CrlValidatedID");
		//endregion
		
		//region Get internal properties from parsed schema
		if(asn1.result.crlHash instanceof asn1js.OctetString)
		{
			this.crlHash = asn1.result.crlHash;
			this._crlHashType = 0;
		}
		else
		{
			this.crlHash = new OtherHashAlgAndValue({ schema: asn1.result.crlHash });
			this._crlHashType = 1;
		}
		
		if("crlIdentifier" in asn1.result)
			this.crlIdentifier = new CrlIdentifier({ schema: asn1.result.crlIdentifier });
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		if(this._crlHashType === (-1))
			throw new Error("Incorrectly initialized \"CrlValidatedID\" class");
		
		//region Create array for output sequence
		const outputArray = [];
		
		if(this._crlHashType === 0) // OCTETSTRING
			outputArray.push(this.crlHash);
		else
			outputArray.push(this.crlHash.toSchema());
		
		if("crlIdentifier" in this)
			outputArray.push(this.crlIdentifier.toSchema());
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
			crlHash: this.crlHash.toJSON()
		};
		
		if("crlIdentifier" in this)
			_object.crlIdentifier = this.crlIdentifier.toJSON();
		
		return _object;
	}
	//**********************************************************************************
	/**
	 * Creates "CrlValidatedID" for given CMS Signed Data and signer index
	 * @param parameters
	 * @returns {Promise}
	 */
	fillValues(parameters)
	{
		//region Initial variables
		const _this = this;
		
		let sequence = Promise.resolve();
		
		let hashAlgorithm = "SHA-1";
		
		let crl;
		//endregion 
		
		//region Check input parameters 
		if("hashAlgorithm" in parameters)
			hashAlgorithm = parameters.hashAlgorithm;
		
		if("crl" in parameters)
			crl = parameters.crl; // in_window.org.pkijs.simpl.CRL
		else
			return Promise.reject("Parameter \"crl\" is mandatory for making \"CrlValidatedID\"");
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
					
					_this._crlHashType = 1;
					_this.crlHash = new OtherHashAlgAndValue({
						hashAlgorithm: new AlgorithmIdentifier({
							algorithmId: oid,
							algorithmParams: new asn1js.Null()
						})
					});
				}
				else
					_this._crlHashType = 0;
				
				return Promise.resolve();
			}
		);
		//endregion 
		
		//region Create all remaining attributes
		sequence = sequence.then(
			() => crypto.digest({ name: hashAlgorithm }, crl.toSchema().toBER(false)),
			error => Promise.reject(error)
		).then(
			result => {
				if(_this._crlHashType === 0)
					_this.crlHash = new asn1js.OctetString({ valueHex: result });
				else
					_this.crlHash.hashValue = new asn1js.OctetString({ valueHex: result });
				
				_this.crlIdentifier = new CrlIdentifier();
				_this.crlIdentifier.fillValues({
					crl
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
