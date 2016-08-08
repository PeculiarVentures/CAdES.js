import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
//**************************************************************************************
export default class SigPolicyQualifierInfo
{
	//**********************************************************************************
	/**
	 * Constructor for SigPolicyQualifierInfo class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @description sigPolicyQualifierId
		 */
		this.sigPolicyQualifierId = getParametersValue(parameters, "sigPolicyQualifierId", SigPolicyQualifierInfo.defaultValues("sigPolicyQualifierId"));
		/**
		 * @type {*}
		 * @description sigQualifier
		 */
		this.sigQualifier = getParametersValue(parameters, "sigQualifier", SigPolicyQualifierInfo.defaultValues("sigQualifier"));
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
			case "sigPolicyQualifierId":
				return "";
			case "sigQualifier":
				return new asn1js.Any();
			default:
				throw new Error(`Invalid member name for SigPolicyQualifierInfo class: ${memberName}`);
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
			case "sigPolicyQualifierId":
				return (memberValue === "");
			case "sigQualifier":
				return (memberValue instanceof asn1js.Any);
			default:
				throw new Error(`Invalid member name for SigPolicyQualifierInfo class: ${memberName}`);
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
		// SigPolicyQualifierInfo ::= SEQUENCE {
		//    sigPolicyQualifierId SigPolicyQualifierId,
		//    sigQualifier ANY DEFINED BY sigPolicyQualifierId }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [type]
		 * @property {string} [setName]
		 * @property {string} [values]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.sigPolicyQualifierId || "") }),
				new asn1js.Any({
					name: (names.sigQualifier || "")
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
			SigPolicyQualifierInfo.schema({
				names: {
					sigPolicyQualifierId: "sigPolicyQualifierId",
					sigQualifier: "sigQualifier"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for SigPolicyQualifierInfo");
		//endregion
		
		//region Get internal properties from parsed schema
		this.sigPolicyQualifierId = asn1.result.sigPolicyQualifierId.valueBlock.toString();
		this.sigQualifier = asn1.result.sigQualifier;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		if(SigPolicyQualifierInfo.compareWithDefault("sigQualifier", this.sigQualifier))
			throw new Error("Non-initialized value for \"sigQualifier\"");
		
		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: [
				new asn1js.ObjectIdentifier({ value: this.sigPolicyQualifierId }),
				this.sigQualifier
			]
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
		if(SigPolicyQualifierInfo.compareWithDefault("sigQualifier", this.sigQualifier))
			throw new Error("Non-initialized value for \"sigQualifier\"");
		
		return {
			sigPolicyQualifierId: this.sigPolicyQualifierId,
			sigQualifier: this.sigQualifier.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
