import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
//**************************************************************************************
export default class OtherRevVals
{
	//**********************************************************************************
	/**
	 * Constructor for OtherRevVals class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @description otherRevValType
		 */
		this.otherRevValType = getParametersValue(parameters, "otherRevValType", OtherRevVals.defaultValues("otherRevValType"));
		/**
		 * @type {*}
		 * @description otherRevVals
		 */
		this.otherRevVals = getParametersValue(parameters, "otherRevVals", OtherRevVals.defaultValues("otherRevVals"));
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
			case "otherRevValType":
				return "";
			case "otherRevVals":
				return new asn1js.Any();
			default:
				throw new Error(`Invalid member name for OtherRevVals class: ${memberName}`);
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
			case "otherRevValType":
				return (memberValue === "");
			case "otherRevVals":
				return (memberValue instanceof asn1js.Any);
			default:
				throw new Error(`Invalid member name for OtherRevVals class: ${memberName}`);
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
		// OtherRevValType ::= OBJECT IDENTIFIER
		//
		//OtherRevVals ::= SEQUENCE {
		//    otherRevValType OtherRevValType,
		//    otherRevVals ANY DEFINED BY OtherRevValType
		//}
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [otherRevValType]
		 * @property {string} [otherRevVals]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.otherRevValType || "") }),
				new asn1js.Any({
					name: (names.otherRevVals || "")
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
			OtherRevVals.schema({
				names: {
					otherRevValType: "otherRevValType",
					otherRevVals: "otherRevVals"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OtherRevVals");
		//endregion
		
		//region Get internal properties from parsed schema
		this.otherRevValType = asn1.result.otherRevValType.valueBlock.toString();
		this.otherRevVals = asn1.result.otherRevVals;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: [
				new asn1js.ObjectIdentifier({ value: this.otherRevValType }),
				this.otherRevVals
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
		return {
			otherRevValType: this.otherRevValType,
			otherRevVals: this.otherRevVals.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
