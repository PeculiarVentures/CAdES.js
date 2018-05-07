import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import CrlOcspRef from "./CrlOcspRef.js";
//**************************************************************************************
export default class CompleteRevocationRefs
{
	//**********************************************************************************
	/**
	 * Constructor for CompleteRevocationRefs class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<CrlOcspRef>}
		 * @description completeRevocationRefs
		 */
		this.completeRevocationRefs = getParametersValue(parameters, "completeRevocationRefs", CompleteRevocationRefs.defaultValues("completeRevocationRefs"));
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
			case "completeRevocationRefs":
				return [];
			default:
				throw new Error(`Invalid member name for CompleteRevocationRefs class: ${memberName}`);
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
			case "completeRevocationRefs":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for CompleteRevocationRefs class: ${memberName}`);
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
		// CompleteRevocationRefs ::= SEQUENCE OF CrlOcspRef
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [optional]
		 * @property {string} [completeRevocationRefs]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			optional: (names.optional || false),
			value: [
				new asn1js.Repeated({
					name: (names.completeRevocationRefs || ""),
					value: CrlOcspRef.schema()
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
			CompleteRevocationRefs.schema({
				names: {
					completeRevocationRefs: "completeRevocationRefs"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CompleteRevocationRefs");
		//endregion
		
		//region Get internal properties from parsed schema
		this.completeRevocationRefs = Array.from(asn1.result.completeRevocationRefs, element => new CrlOcspRef({ schema: element }));
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
			value: Array.from(this.completeRevocationRefs, element => element.toSchema())
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
			completeRevocationRefs: Array.from(this.completeRevocationRefs, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
