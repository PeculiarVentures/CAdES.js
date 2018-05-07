import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import { CertificateRevocationList, OCSPResponse } from "pkijs";
import OtherRevVals from "./OtherRevVals.js";
//**************************************************************************************
// noinspection JSUnusedGlobalSymbols
export default class RevocationInfoArchival
{
	//**********************************************************************************
	/**
	 * Constructor for RevocationInfoArchival class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("crl" in parameters)
			/**
			 * @type {Array.<CertificateRevocationList>}
			 * @description crl
			 */
			this.crl = getParametersValue(parameters, "crl", RevocationInfoArchival.defaultValues("crl"));
		
		if("ocsp" in parameters)
			/**
			 * @type {Array.<OCSPResponse>}
			 * @description ocsp
			 */
			this.ocsp = getParametersValue(parameters, "ocsp", RevocationInfoArchival.defaultValues("ocsp"));
		
		if("otherRevInfo" in parameters)
			/**
			 * @type {Array.<otherRevInfo>}
			 * @description otherRevInfo
			 */
			this.otherRevInfo = getParametersValue(parameters, "otherRevInfo", RevocationInfoArchival.defaultValues("otherRevInfo"));
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
			case "crl":
			case "ocsp":
			case "otherRevInfo":
				return [];
			default:
				throw new Error(`Invalid member name for RevocationInfoArchival class: ${memberName}`);
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
			case "crl":
			case "ocsp":
			case "otherRevInfo":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for RevocationInfoArchival class: ${memberName}`);
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
		//RevocationInfoArchival ::= SEQUENCE {
		//    crl [0] EXPLICIT SEQUENCE of CRLs, OPTIONAL
		//    ocsp [1] EXPLICIT SEQUENCE of OCSP Responses, OPTIONAL
		//    otherRevInfo [2] EXPLICIT SEQUENCE of OtherRevInfo, OPTIONAL
		//}
		//OtherRevInfo ::= SEQUENCE {
		//    Type OBJECT IDENTIFIER
		//    Value OCTET STRING
		//}
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [crl]
		 * @property {string} [ocsp]
		 * @property {string} [otherRevInfo]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						new asn1js.Sequence({
							value: [
								new asn1js.Repeated({
									name: (names.crl || ""),
									value: CertificateRevocationList.schema()
								})
							]
						})
					]
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [
						new asn1js.Sequence({
							value: [
								new asn1js.Repeated({
									name: (names.ocsp || ""),
									value: OCSPResponse.schema()
								})
							]
						})
					]
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					value: [
						OtherRevVals.schema({
							name: (names.otherRevInfo || {
								names: {
									blockName: "otherRevInfo"
								}
							})
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
			RevocationInfoArchival.schema({
				names: {
					crl: "crl",
					ocsp: "ocsp",
					otherRevInfo: {
						names: {
							blockName: "otherRevInfo"
						}
					}
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RevocationInfoArchival");
		//endregion
		
		//region Get internal properties from parsed schema
		if("crl" in asn1.result)
			this.crl = Array.from(asn1.result.crl, element => new CertificateRevocationList({ schema: element }));
		
		if("ocsp" in asn1.result)
			this.ocsp = Array.from(asn1.result.ocsp, element => new OCSPResponse({ schema: element }));
		
		if("otherRevInfo" in asn1.result)
			this.otherRevInfo = new OtherRevVals({ schema: asn1.result.otherRevInfo });
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
		
		if("crl" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [
					new asn1js.Sequence({
						value: Array.from(this.crl, element => element.toSchema())
					})
				]
			}));
		}
		
		if("ocsp" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: [
					new asn1js.Sequence({
						value: Array.from(this.ocsp, element => element.toSchema())
					})
				]
			}));
		}
		
		if("otherRevInfo" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				value: [this.otherRevInfo.toSchema()]
			}));
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
		const _object = {};
		
		if("crl" in this)
			_object.crl = Array.from(this.crl, element => element.toJSON());
		
		if("ocsp" in this)
			_object.ocsp = Array.from(this.ocsp, element => element.toJSON());
		
		if("otherRevInfo" in this)
			_object.otherRevInfo = this.otherRevInfo.toJSON();
		
		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
