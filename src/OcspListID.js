import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import OcspResponsesID from "./OcspResponsesID.js";
//**************************************************************************************
export default class OcspListID
{
	//**********************************************************************************
	/**
	 * Constructor for OcspListID class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<OcspResponsesID>}
		 * @description ocspResponses
		 */
		this.ocspResponses = getParametersValue(parameters, "ocspResponses", OcspListID.defaultValues("ocspResponses"));
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
			case "ocspResponses":
				return [];
			default:
				throw new Error(`Invalid member name for OcspListID class: ${memberName}`);
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
			case "ocspResponses":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for OcspListID class: ${memberName}`);
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
		//OcspListID ::= SEQUENCE {
		//    ocspResponses SEQUENCE OF OcspResponsesID }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [ocspResponses]
		 * @property {string} [optional]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			optional: (names.optional || false),
			value: [
				new asn1js.Repeated({
					value: new asn1js.Sequence({
						value: [
							new asn1js.Repeated({
								name: (names.ocspResponses || ""),
								value: OcspResponsesID.schema({
									names: {
										blockName: "ocspResponses.int",
										ocspIdentifier: {
											names: {
												blockName: "ocspIdentifier"
											}
										}
									}
								})
							})
						]
					})
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
			OcspListID.schema({
				names: {
					ocspResponses: "ocspResponses"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OcspListID");
		//endregion
		
		//region Get internal properties from parsed schema
		this.ocspResponses = Array.from(asn1.result.ocspResponses, element => new OcspResponsesID({ schema: element }));
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
				new asn1js.Sequence({
					value: Array.from(this.ocspResponses, element => element.toSchema())
				})
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
			ocspResponses: Array.from(this.ocspResponses, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
