import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
//**************************************************************************************
export default class OtherRevRefs
{
	//**********************************************************************************
	/**
	 * Constructor for OtherRevRefs class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @description otherRevRefType
		 */
		this.otherRevRefType = getParametersValue(parameters, "otherRevRefType", OtherRevRefs.defaultValues("otherRevRefType"));
		/**
		 * @type {*}
		 * @description otherRevRefs
		 */
		this.otherRevRefs = getParametersValue(parameters, "otherRevRefs", OtherRevRefs.defaultValues("otherRevRefs"));
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
			case "otherRevRefType":
				return "";
			case "otherRevRefs":
				return new asn1js.Any();
			default:
				throw new Error(`Invalid member name for OtherRevRefs class: ${memberName}`);
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
			case "otherRevRefType":
				return (memberValue === "");
			case "otherRevRefs":
				return (memberValue instanceof asn1js.Any);
			default:
				throw new Error(`Invalid member name for OtherRevRefs class: ${memberName}`);
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
		// OtherRevRefType ::= OBJECT IDENTIFIER
		//
		// OtherRevRefs ::= SEQUENCE {
		//    otherRevRefType OtherRevRefType,
		//    otherRevRefs ANY DEFINED BY otherRevRefType
		//}
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [otherRevRefType]
		 * @property {string} [otherRevRefs]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.otherRevRefType || "") }),
				new asn1js.Any({
					name: (names.otherRevRefs || "")
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
			OtherRevRefs.schema({
				names: {
					otherRevRefType: "otherRevRefType",
					otherRevRefs: "otherRevRefs"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OtherRevRefs");
		//endregion
		
		//region Get internal properties from parsed schema
		this.otherRevRefType = asn1.result.otherRevRefType.valueBlock.toString();
		this.otherRevRefs = asn1.result.otherRevRefs;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		if(this.otherRevRefs instanceof asn1js.Any)
			throw new Error("Incorrectly initialized \"OtherRevRefs\" class");
		
		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: [
				new asn1js.ObjectIdentifier({ value: this.otherRevRefType }),
				this.otherRevRefs
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
		if(this.otherRevRefs instanceof asn1js.Any)
			throw new Error("Incorrectly initialized \"OtherRevRefs\" class");
		
		return {
			otherRevRefType: this.otherRevRefType,
			otherRevRefs: this.otherRevRefs.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
