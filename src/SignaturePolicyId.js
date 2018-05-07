import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import OtherHashAlgAndValue from "./OtherHashAlgAndValue.js";
import SigPolicyQualifierInfo from "./SigPolicyQualifierInfo.js";
//**************************************************************************************
// noinspection JSUnusedGlobalSymbols
export default class SignaturePolicyId
{
	//**********************************************************************************
	/**
	 * Constructor for SignaturePolicyId class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @description sigPolicyId
		 */
		this.sigPolicyId = getParametersValue(parameters, "sigPolicyId", SignaturePolicyId.defaultValues("sigPolicyId"));
		/**
		 * @type {OtherHashAlgAndValue}
		 * @description sigPolicyHash
		 */
		this.sigPolicyHash = getParametersValue(parameters, "sigPolicyHash", SignaturePolicyId.defaultValues("sigPolicyHash"));
		
		if("sigPolicyQualifiers" in parameters)
			/**
			 * @type {Array.<SigPolicyQualifierInfo>}
			 * @description sigPolicyQualifiers
			 */
			this.sigPolicyQualifiers = getParametersValue(parameters, "sigPolicyQualifiers", SignaturePolicyId.defaultValues("sigPolicyQualifiers"));
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
			case "sigPolicyId":
				return "";
			case "sigPolicyHash":
				return new OtherHashAlgAndValue();
			case "sigPolicyQualifiers":
				return [];
			default:
				throw new Error(`Invalid member name for SignaturePolicyId class: ${memberName}`);
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
			case "sigPolicyId":
				return (memberValue === "");
			case "sigPolicyHash":
				return (OtherHashAlgAndValue.compareWithDefault("hashAlgorithm", memberValue.hashAlgorithm) &&
						OtherHashAlgAndValue.compareWithDefault("hashValue", memberValue.hashValue));
			case "sigPolicyQualifiers":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for SignaturePolicyId class: ${memberName}`);
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
		// SignaturePolicyId ::= SEQUENCE {
		//    sigPolicyId SigPolicyId,
		//    sigPolicyHash SigPolicyHash,
		//    sigPolicyQualifiers SEQUENCE SIZE (1..MAX) OF
		//    SigPolicyQualifierInfo OPTIONAL}
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [sigPolicyId]
		 * @property {string} [sigPolicyHash]
		 * @property {string} [sigPolicyQualifiers]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.sigPolicyId || "") }),
				OtherHashAlgAndValue.schema(names.sigPolicyHash || {
					names: {
						blockName: ""
					}
				}),
				new asn1js.Sequence({
					optional: true,
					value: [
						new asn1js.Repeated({
							name: (names.sigPolicyQualifiers || ""),
							value: SigPolicyQualifierInfo.schema()
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
			SignaturePolicyId.schema({
				names: {
					sigPolicyId: "sigPolicyId",
					sigPolicyHash: {
						names: {
							blockName: "sigPolicyHash"
						}
					},
					sigPolicyQualifiers: "sigPolicyQualifiers"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for SignaturePolicyId");
		//endregion
		
		//region Get internal properties from parsed schema
		this.sigPolicyId = asn1.result.sigPolicyId.valueBlock.toString();
		this.sigPolicyHash = new OtherHashAlgAndValue({ schema: asn1.result.sigPolicyHash });
		
		if("sigPolicyQualifiers" in asn1.result)
			this.sigPolicyQualifiers = Array.from(asn1.result.sigPolicyQualifiers, element => new SigPolicyQualifierInfo({ schema: element }));
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
			new asn1js.ObjectIdentifier({ value: this.sigPolicyId }),
			this.sigPolicyHash.toSchema()
		];
		
		if("sigPolicyQualifiers" in this)
		{
			outputArray.push(new asn1js.Sequence({
				value: Array.from(this.sigPolicyQualifiers, element => element.toSchema())
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
		const _object = {
			sigPolicyId: this.sigPolicyId,
			sigPolicyHash: this.sigPolicyHash.toJSON()
		};
		
		if("sigPolicyQualifiers" in this)
			_object.sigPolicyQualifiers = Array.from(this.sigPolicyQualifiers, element => element.toJSON());
		
		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
